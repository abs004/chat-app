import { Server } from "socket.io";
import env from "../config/env.js";
import { verifyToken } from "../utils/token.js";
import { registerIo } from "./socketRegistry.js";
import { checkBanStatus } from "../utils/banCheck.js";
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

  // Make io accessible to controllers/services without circular imports
  registerIo(io);

  // Socket authentication middleware — verify JWT then check live ban status
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return next(new Error("Authentication error: invalid token"));
    }

    try {
      const { banned, message } = await checkBanStatus(decoded.userId);
      if (banned) return next(new Error(`Banned: ${message}`));
    } catch {
      // DB unreachable — fail open, do not block socket
    }

    socket.userId = decoded.userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.userId}`);
    io.emit("admin-user-count", { count: io.engine.clientsCount });

    // Register event groups — each handler file is responsible for its own events
    registerMatchHandlers(socket, io);
    registerMessageHandlers(socket, io);

    socket.on("disconnect", () => {
      io.emit("admin-user-count", { count: io.engine.clientsCount });
    });
  });

  return io;
};

export default initSocket;
