import Message from "../models/Message.js";

/**
 * Deletes all messages associated with a conversation.
 * Useful for cleaning up history once a conversation has ended,
 * while allowing messages to persist during the active chat.
 *
 * @param {string|ObjectId} conversationId
 */
export const deleteConversationMessages = async (conversationId) => {
  if (!conversationId) return;
  try {
    const result = await Message.deleteMany({ conversation: conversationId });
    console.log(`[messageCleanup] Deleted ${result.deletedCount} messages for conversation ${conversationId}`);
  } catch (error) {
    console.error(`[messageCleanup] Failed to delete messages for conversation ${conversationId}:`, error.message);
  }
};
