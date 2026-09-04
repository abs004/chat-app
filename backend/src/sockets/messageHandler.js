import sanitize from "mongo-sanitize";
import Message from "../models/Message.js";

const MAX_CONTENT_LENGTH = 500;

/**
 * Registers the send-message socket event handler for a connected socket.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerMessageHandlers = (socket, io) => {
  socket.on("typing", ({ conversationId } = {}) => {
    if (!conversationId) return;
    socket.to(conversationId).emit("typing");
  });

  socket.on("stop-typing", ({ conversationId } = {}) => {
    if (!conversationId) return;
    socket.to(conversationId).emit("stop-typing");
  });

  socket.on("send-message", async ({ conversationId, content, replyTo } = {}) => {
    if (!conversationId) return;

    // 1. Strip any MongoDB operator keys (e.g. $where, $gt) from the payload.
    const sanitized = sanitize(content);

    // 2. Trim surrounding whitespace.
    const trimmed = typeof sanitized === "string" ? sanitized.trim() : "";

    // 3. Reject empty content after sanitization + trim.
    if (!trimmed) {
      socket.emit("message-error", { message: "Message cannot be empty" });
      return;
    }

    // 4. Enforce maximum message length.
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      socket.emit("message-error", { message: "Message too long" });
      return;
    }

    // 5. Validate and sanitize optional replyTo.
    let replyToField = null;
    if (replyTo && typeof replyTo === "object" && replyTo.messageId) {
      const replyContent = typeof replyTo.content === "string"
        ? replyTo.content.slice(0, 200)
        : null;
      replyToField = {
        messageId:   replyTo.messageId,
        content:     replyContent,
        senderIsYou: typeof replyTo.senderIsYou === "boolean" ? replyTo.senderIsYou : null,
      };
    }

    try {
      const message = new Message({
        sender:       socket.userId,
        conversation: conversationId,
        content:      trimmed,
        ...(replyToField ? { replyTo: replyToField } : {}),
      });

      await message.save();

      // Broadcast the saved message (with _id, createdAt, and replyTo) to the entire room
      io.to(conversationId).emit("receive-message", message.toObject());
    } catch (err) {
      console.error("[Socket] send-message error:", err.message);
      // Notify sender of the failure so the UI can display an error state
      socket.emit("message-error", { message: "Failed to send message" });
    }
  });
};

export default registerMessageHandlers;
