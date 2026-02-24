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
// 1. Matching Queue & Conversations managed via Socket events


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

// 🔥 Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user
    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    // 5️⃣ Send success response
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

//login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Compare password
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

// 📩 Socket Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on("match-me", async () => {
    const userId = socket.userId;

    // Check if user is already in an active conversation (e.g. on rejoin)
    const existingConversation = await Conversation.findOne({
      participants: userId,
      isActive: true
    });

    if (existingConversation) {
      socket.join(existingConversation._id.toString());
      return socket.emit("match-found", { conversationId: existingConversation._id });
    }

    // Remove self from queue first to prevent self-match
    waitingQueue = waitingQueue.filter(u => u.userId !== userId);

    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift();

      const newConversation = new Conversation({
        participants: [userId, partner.userId]
      });

      await newConversation.save();

      // Join both to the room
      socket.join(newConversation._id.toString());
      partner.socket.join(newConversation._id.toString());

      io.to(newConversation._id.toString()).emit("match-found", {
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

      // Broadcast to room
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
    waitingQueue = waitingQueue.filter(u => u.userId !== socket.userId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    waitingQueue = waitingQueue.filter(u => u.userId !== socket.userId);
    // Note: In a fuller implementation, we'd also notify active rooms here.
  });
});

app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected profile data",
    userId: req.user.userId
  });
});

// GET messages remains for initial history load if needed
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
