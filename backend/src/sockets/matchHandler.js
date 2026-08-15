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
        // Partner is still connected — safe to rejoin
        socket.join(roomId);
        return socket.emit("match-found", { conversationId: existingConversation._id });
      } else {
        // Partner is gone — invalidate and fall through to re-queue
        await Conversation.findByIdAndUpdate(existingConversation._id, {
          isActive: false,
        });
      }
    }

    // Remove self from queue to prevent self-match on rapid clicks or reconnects
    waitingQueue = waitingQueue.filter((u) => u.userId !== userId);

    // Purge stale entries whose socket has since disconnected.
    // Without this, a ghost entry silently matches with the next user
    // and partner.socket.join(roomId) does nothing — leaving them in a broken room.
    waitingQueue = waitingQueue.filter((u) => u.socket.connected);

    if (waitingQueue.length > 0) {
      // FIX: `const partner = waitingQueue.shift()` was missing here.
      // Without it, `partner` is undefined → ReferenceError → silent async crash
      // → shift() never runs → queued user stays forever → every new user crashes against them.
      const partner = waitingQueue.shift();

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
    // Remove by socket.id (not userId) so a user with two open tabs
    // only loses the tab that actually left, not both queue entries.
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[Socket] User disconnected: ${socket.userId}`);
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);
  });
};

export default registerMatchHandlers;