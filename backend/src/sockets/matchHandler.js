import Conversation from "../models/Conversation.js";

/**
 * In-memory queue of users waiting to be matched.
 * Each entry: { userId: string, socket: Socket }
 *
 * Note: This is a single-process solution. For horizontal scaling,
 * replace with a Redis-backed queue (e.g. bull or ioredis).
 */
let waitingQueue = [];

/**
 * Registers match and leave-chat socket event handlers for a connected socket.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerMatchHandlers = (socket, io) => {
  // ── match-me ──────────────────────────────────────────────────────────────
  socket.on("match-me", async () => {
    const userId = socket.userId;

    // If user already has an active conversation (e.g. page refresh), rejoin it
    const existingConversation = await Conversation.findOne({
      participants: userId,
      isActive: true,
    });

    if (existingConversation) {
      const roomId = existingConversation._id.toString();
      const roomSockets = await io.in(roomId).fetchSockets();

      if (roomSockets.length > 0) {
        socket.join(roomId);
        return socket.emit("match-found", { conversationId: existingConversation._id });
      } else {
        // Partner gone — invalidate and fall through to re-queue
        await Conversation.findByIdAndUpdate(existingConversation._id, { isActive: false });
      }
    }

    // Remove self from queue to prevent self-match on rapid clicks
    waitingQueue = waitingQueue.filter((u) => u.userId !== userId);
    // ✅ ADD THIS — flush dead sockets before matching
    waitingQueue = waitingQueue.filter((u) => u.socket.connected);

    if (waitingQueue.length > 0) {
      const conversation = new Conversation({
        participants: [userId, partner.userId],
      });
      await conversation.save();

      const roomId = conversation._id.toString();
      socket.join(roomId);
      partner.socket.join(roomId);

      io.to(roomId).emit("match-found", { conversationId: conversation._id });
    } else {
      waitingQueue.push({ userId, socket });
      socket.emit("waiting", { message: "Looking for a match..." });
    }
  });

  // ── leave-chat ────────────────────────────────────────────────────────────
  socket.on("leave-chat", async ({ conversationId } = {}) => {
    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, { isActive: false });
      socket.to(conversationId).emit("partner-disconnected");
      socket.leave(conversationId);
    }
    // Clean up from queue if user leaves while waiting
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[Socket] User disconnected: ${socket.userId}`);
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);
    // Future: notify active room partner here
  });
};

export default registerMatchHandlers;
