import mongoose from "mongoose";
import sanitize from "mongo-sanitize";

const MAX_CONTENT_LENGTH = 500;

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient history retrieval ordered by time
messageSchema.index({ conversation: 1, createdAt: 1 });

/**
 * Pre-save hook — second layer of defense.
 * Sanitizes MongoDB operator keys and enforces length constraints even if
 * the socket handler is bypassed (e.g. direct service calls, future REST routes).
 */
messageSchema.pre("save", function (next) {
  // Strip $ operator keys from the content field
  const sanitized = sanitize(this.content);
  const trimmed = typeof sanitized === "string" ? sanitized.trim() : "";

  if (!trimmed) {
    return next(new Error("Message cannot be empty"));
  }

  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return next(new Error("Message too long"));
  }

  this.content = trimmed;
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
