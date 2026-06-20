import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

/**
 * Fetches all messages for a conversation and its active status.
 * @param {string} conversationId
 * @returns {{ messages: Message[], isActive: boolean }}
 * @throws {Error} with statusCode 404 if conversation not found
 */
export const getConversationMessages = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  const messages = await Message.find({ conversation: conversationId }).sort({
    createdAt: 1,
  });

  return { messages, isActive: conversation.isActive };
};
