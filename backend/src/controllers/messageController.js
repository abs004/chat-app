import { getConversationMessages } from "../services/messageService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * GET /messages/:conversationId
 * Returns message history and conversation status for a given conversation.
 */
export const handleGetMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const result = await getConversationMessages(conversationId);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
