import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const reportedConversations = new Set();

export const deleteConversationMessages = async (conversationId) => {
  if (!conversationId) return;
  try {
    const result = await Message.deleteMany({ conversation: conversationId });
    console.log(`[messageCleanup] Deleted ${result.deletedCount} messages for conversation ${conversationId}`);
  } catch (error) {
    console.error(`[messageCleanup] Failed to delete messages for conversation ${conversationId}:`, error.message);
  }
};

const deletionTimers = new Map();
const DELETION_DELAY_MS = 15 * 60 * 1000;

export const scheduleMessageDeletion = (conversationId) => {
  if (!conversationId) return;

  const key = conversationId.toString();

  // ✅ Skip if this conversation has been reported
  if (reportedConversations.has(key)) {
    console.log(`[messageCleanup] Skipping deletion for reported conversation ${key}`);
    return;
  }

  if (deletionTimers.has(key)) {
    clearTimeout(deletionTimers.get(key));
    deletionTimers.delete(key);
  }

  const timer = setTimeout(async () => {
    deletionTimers.delete(key);
    await deleteConversationMessages(conversationId);
    try {
      const conversation = await Conversation.findById(conversationId);
      if (conversation && !conversation.reported) {
        await Conversation.findByIdAndDelete(conversationId);
        console.log(`[messageCleanup] Deleted conversation ${key}`);
      }
    } catch (err) {
      console.error(`[messageCleanup] Failed to delete conversation ${key}:`, err.message);
    }
  }, DELETION_DELAY_MS);

  deletionTimers.set(key, timer);

  Conversation.findByIdAndUpdate(conversationId, {
    deletionScheduledAt: new Date(),
  }).catch((err) => {
    console.error(`[messageCleanup] Failed to stamp deletionScheduledAt for ${key}:`, err.message);
  });

  console.log(`[messageCleanup] Deletion scheduled in 15 min for conversation ${key}`);
};

export const cancelMessageDeletion = (conversationId) => {
  if (!conversationId) return false;

  const key = conversationId.toString();

  if (!deletionTimers.has(key)) return false;

  clearTimeout(deletionTimers.get(key));
  deletionTimers.delete(key);

  console.log(`[messageCleanup] Deletion cancelled for conversation ${key} (report filed)`);
  return true;
};

// ✅ Defined after cancelMessageDeletion so it can reference it
export const markConversationReported = (conversationId) => {
  reportedConversations.add(conversationId.toString());
  cancelMessageDeletion(conversationId);
};