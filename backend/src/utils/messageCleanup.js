import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

/**
 * Deletes all messages associated with a conversation.
 * Used as the actual deletion logic by scheduleMessageDeletion,
 * and can also be called directly for immediate deletion.
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

// ── Delayed deletion ──────────────────────────────────────────────────────────
// Keyed by conversationId.toString() → NodeJS.Timeout
// If a report is filed within the 15-minute window, the timer can be cancelled
// via cancelMessageDeletion() to preserve the messages for review.
const deletionTimers = new Map();

const DELETION_DELAY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Schedules message deletion for a conversation after a 15-minute grace period.
 * If a timer already exists for the same conversation, it is replaced to prevent
 * duplicate timers. Also stamps deletionScheduledAt on the Conversation document.
 *
 * @param {string|ObjectId} conversationId
 */
export const scheduleMessageDeletion = (conversationId) => {
  if (!conversationId) return;

  const key = conversationId.toString();

  // Cancel any existing timer so we don't double-delete
  if (deletionTimers.has(key)) {
    clearTimeout(deletionTimers.get(key));
    deletionTimers.delete(key);
  }

  const timer = setTimeout(async () => {
    deletionTimers.delete(key);
    await deleteConversationMessages(conversationId);
  }, DELETION_DELAY_MS);

  deletionTimers.set(key, timer);

  // Stamp the scheduled time on the Conversation document so background jobs
  // and the admin dashboard can see when deletion is expected.
  Conversation.findByIdAndUpdate(conversationId, {
    deletionScheduledAt: new Date(),
  }).catch((err) => {
    console.error(`[messageCleanup] Failed to stamp deletionScheduledAt for ${key}:`, err.message);
  });

  console.log(`[messageCleanup] Deletion scheduled in 15 min for conversation ${key}`);
};

/**
 * Cancels a pending scheduled deletion, e.g. when a report is submitted
 * and messages must be preserved for review.
 *
 * @param {string|ObjectId} conversationId
 * @returns {boolean} true if a timer was found and cancelled, false otherwise
 */
export const cancelMessageDeletion = (conversationId) => {
  if (!conversationId) return false;

  const key = conversationId.toString();

  if (!deletionTimers.has(key)) return false;

  clearTimeout(deletionTimers.get(key));
  deletionTimers.delete(key);

  console.log(`[messageCleanup] Deletion cancelled for conversation ${key} (report filed)`);
  return true;
};
