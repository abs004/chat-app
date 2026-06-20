import { API_BASE_URL } from "../../constants/config.js";
import { getToken } from "../../utils/token.js";

/**
 * Fetches the message history and active status for a conversation.
 * Requires a valid auth token in localStorage.
 *
 * @param {string} conversationId
 * @returns {Promise<{ messages: object[], isActive: boolean }>}
 */
export const fetchMessages = async (conversationId) => {
  const res = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch messages");
    err.status = res.status;
    throw err;
  }

  // Unwrap the standardized { success, data: { messages, isActive } } response
  return data.data;
};
