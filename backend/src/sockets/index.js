import { Server } from "socket.io";
import env from "../config/env.js";
import { verifyToken } from "../utils/token.js";
import registerMatchHandlers from "./matchHandler.js";
import registerMessageHandlers from "./messageHandler.js";

/**
 * Initializes Socket.IO on the given HTTP server.
 * - Attaches authentication middleware so unauthenticated connections are rejected
 * - Registers all event handlers on each connection
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server} the configured io instance
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  // Socket authentication middleware — mirrors the HTTP auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.userId}`);

    // Register event groups — each handler file is responsible for its own events
    registerMatchHandlers(socket, io);
    registerMessageHandlers(socket, io);
  });

  return io;
};

export default initSocket;
