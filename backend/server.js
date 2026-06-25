import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory matching queue (objects with userId and socket)
let waitingQueue = [];

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// Socket Auth Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Socket Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on("match-me", async () => {
    const userId = socket.userId;

    // FIX 1: Only re-join an existing conversation if THIS socket's user
    // is genuinely still a participant AND the conversation is active.
    // Also make sure the conversation doesn't include a partner who has
    // since disconnected — if so, mark it inactive so the user re-queues.
    const existingConversation = await Conversation.findOne({
      participants: userId,
      isActive: true
    });

    if (existingConversation) {
      // Check the room still has a connected peer before re-joining
      const roomId = existingConversation._id.toString();
      const roomSockets = await io.in(roomId).fetchSockets();

      if (roomSockets.length > 0) {
        // Partner is still connected — safe to rejoin
        socket.join(roomId);
        return socket.emit("match-found", { conversationId: existingConversation._id });
      } else {
        // Partner is gone — close this conversation so user gets a fresh match
        await Conversation.findByIdAndUpdate(existingConversation._id, { isActive: false });
      }
    }

    // FIX 2: Remove self from queue to prevent self-match (same user, new socket)
    waitingQueue = waitingQueue.filter(u => u.userId !== userId);

    // FIX 3: Purge any queued entries whose socket has since disconnected.
    // Without this, a ghost entry matches with the next user and the room
    // silently breaks because partner.socket.join() does nothing useful.
    waitingQueue = waitingQueue.filter(u => u.socket.connected);

    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift();

      const newConversation = new Conversation({
        participants: [userId, partner.userId]
      });

      await newConversation.save();

      const roomId = newConversation._id.toString();

      socket.join(roomId);
      partner.socket.join(roomId);

      io.to(roomId).emit("match-found", {
        conversationId: newConversation._id
      });
    } else {
      waitingQueue.push({ userId, socket });
      socket.emit("waiting", { message: "Looking for a match..." });
    }
  });

  socket.on("send-message", async (data) => {
    const { conversationId, content } = data;
    if (!conversationId || !content) return;

    try {
      const newMessage = new Message({
        sender: socket.userId,
        conversation: conversationId,
        content
      });

      await newMessage.save();

      io.to(conversationId).emit("receive-message", newMessage);
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("leave-chat", async (data) => {
    const { conversationId } = data;
    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, { isActive: false });
      socket.to(conversationId).emit("partner-disconnected");
      socket.leave(conversationId);
    }
    // FIX 4: Remove by socket ID, not just userId.
    // Removing by userId would accidentally kick out a user who opened a
    // second tab and is legitimately waiting in the queue from that tab.
    waitingQueue = waitingQueue.filter(u => u.socket.id !== socket.id);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    // FIX 4 (same): remove by socket ID so multi-tab users aren't over-removed
    waitingQueue = waitingQueue.filter(u => u.socket.id !== socket.id);
  });
});

app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected profile data",
    userId: req.user.userId
  });
});

app.get("/messages/:conversationId", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Not found" });

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
    res.json({ messages, isActive: conversation.isActive });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});