import Message from "../models/Message.js";

/**
 * Registers the send-message socket event handler for a connected socket.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerMessageHandlers = (socket, io) => {
  socket.on("send-message", async ({ conversationId, content } = {}) => {
    if (!conversationId || !content?.trim()) return;

    try {
      const message = new Message({
        sender: socket.userId,
        conversation: conversationId,
        content: content.trim(),
      });

      await message.save();

      // Broadcast the saved message (with _id and createdAt) to the entire room
      io.to(conversationId).emit("receive-message", message);
    } catch (err) {
      console.error("[Socket] send-message error:", err.message);
      // Notify sender of the failure so the UI can display an error state
      socket.emit("message-error", { message: "Failed to send message" });
    }
  });
};

export default registerMessageHandlers;
