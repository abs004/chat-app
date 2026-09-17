import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { decryptMessage } from "../utils/crypto.js";

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

  const decryptedMessages = messages.map(msg => {
    const obj = msg.toObject();
    obj.content = decryptMessage(obj.content);
    if (obj.replyTo && obj.replyTo.content) {
      obj.replyTo.content = decryptMessage(obj.replyTo.content);
    }
    return obj;
  });

  return { messages: decryptedMessages, isActive: conversation.isActive };
};
