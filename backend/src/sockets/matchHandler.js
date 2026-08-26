import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import {
  deleteConversationMessages,
  scheduleMessageDeletion,
} from "../utils/messageCleanup.js";

/**
 * In-memory queue of users waiting to be matched.
 * Each entry: { userId: string, socket: Socket }
 */
let waitingQueue = [];

/**
 * Grace-period timers for disconnected users.
 * Keyed by userId → NodeJS.Timeout.
 * If the user reconnects within 10s, the timer is cancelled and the
 * conversation is left intact so both parties can resume.
 */
const disconnectTimers = new Map();

/**
 * Keeps the last 3 recent partner IDs on a socket.
 * The raw token is pushed to the front; duplicates are removed; list capped at 3.
 */
const addRecentPartner = (sock, partnerUserId) => {
  if (!sock.recentPartners) sock.recentPartners = [];
  sock.recentPartners = [
    partnerUserId,
    ...sock.recentPartners.filter((id) => id !== partnerUserId),
  ].slice(0, 3);
};

/**
 * Registers match and leave-chat socket event handlers for a connected socket.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerMatchHandlers = (socket, io) => {
  // Track recent partners in memory so we can deprioritize rematches
  socket.recentPartners = [];
  // ── match-me ──────────────────────────────────────────────────────────────
  socket.on("match-me", async () => {
    const userId = socket.userId;

    // If the user reconnects within the grace period, cancel the pending cleanup
    // so the conversation and messages are not wiped.
    if (disconnectTimers.has(userId)) {
      clearTimeout(disconnectTimers.get(userId));
      disconnectTimers.delete(userId);
      console.log(`[Socket] Reconnect within grace period — cancelled cleanup for ${userId}`);
    }

    // Check if there is an active conversation to rejoin.
    // We trust the disconnect timer as the source of truth: if the conversation
    // is still isActive: true, it means the grace period hasn't expired yet.
    const conversation = await Conversation.findOne({
      participants: userId,
      isActive: true,
    });

    if (conversation) {
      const roomId = conversation._id.toString();
      const partnerId = conversation.participants
        .find((p) => p.toString() !== userId);
      const partnerUser = await User.findById(partnerId).select("avatarSeed");
      socket.join(roomId);
      socket.emit("match-found", {
        conversationId: conversation._id,
        partnerUserId: partnerId,
        partnerAvatarSeed: partnerUser?.avatarSeed || "default",
      });
      return;
    }

    // Close any stale active conversations before attempting a new match.
    // This is a safety net for cases where leave-chat was not properly emitted
    // (e.g. a missed beforeunload, a React strict-mode double-mount, or a
    // network blip that prevented the event from reaching the server).
    await Conversation.updateMany(
      { participants: userId, isActive: true },
      { isActive: false }
    );

    // Remove self from queue to prevent self-match on rapid clicks or reconnects
    waitingQueue = waitingQueue.filter((u) => u.userId !== userId);

    // Purge stale entries whose socket has since disconnected.
    // Without this, a ghost entry silently matches with the next user
    // and partner.socket.join(roomId) does nothing — leaving them in a broken room.
    waitingQueue = waitingQueue.filter((u) => u.socket.connected);

    if (waitingQueue.length > 0) {
      // Prefer someone not in either user's recent partners to avoid instant rematches.
      // Fall back to the first waiting user if everyone is a recent partner.
      const preferred = waitingQueue.find(
        (u) =>
          !socket.recentPartners?.includes(u.userId) &&
          !u.socket.recentPartners?.includes(socket.userId)
      );
      const partner = preferred ?? waitingQueue[0];
      waitingQueue.splice(waitingQueue.indexOf(partner), 1);

      const conversation = new Conversation({
        participants: [userId, partner.userId],
      });
      await conversation.save();

      const roomId = conversation._id.toString();
      socket.join(roomId);
      partner.socket.join(roomId);

      // Fetch both users' avatarSeed to send in the match payload
      const [userA, userB] = await Promise.all([
        User.findById(userId).select("avatarSeed"),
        User.findById(partner.userId).select("avatarSeed"),
      ]);

      // Emit separately so each user receives their own partner's userId and avatar
      socket.emit("match-found", {
        conversationId: conversation._id,
        partnerUserId: partner.userId,
        partnerAvatarSeed: userB?.avatarSeed || "default",
      });
      partner.socket.emit("match-found", {
        conversationId: conversation._id,
        partnerUserId: userId,
        partnerAvatarSeed: userA?.avatarSeed || "default",
      });
    } else {
      waitingQueue.push({ userId, socket });
      socket.emit("waiting", { message: "Looking for a match..." });
    }
  });

  // ── leave-chat ────────────────────────────────────────────────────────────
  socket.on("leave-chat", async ({ conversationId } = {}) => {
    if (conversationId) {
      const conv = await Conversation.findByIdAndUpdate(conversationId, { isActive: false }, { new: true });
      socket.to(conversationId).emit("partner-disconnected");

      // Update recentPartners for both sides before leaving the room
      if (conv) {
        const roomId = conv._id.toString();
        const roomSockets = await io.in(roomId).fetchSockets();
        const partnerSocket = roomSockets.find((s) => s.userId !== socket.userId);
        const partnerIdFromConv = conv.participants
          .find((p) => p.toString() !== socket.userId)?.toString();

        if (partnerIdFromConv) addRecentPartner(socket, partnerIdFromConv);
        if (partnerSocket) addRecentPartner(partnerSocket, socket.userId);
      }

      socket.leave(conversationId);
      // Schedule deletion after 15 min so messages are preserved if a report is filed
      scheduleMessageDeletion(conversationId);
    }
    // Remove by socket.id (not userId) so a user with two open tabs
    // only loses the tab that actually left, not both queue entries.
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    const userId = socket.userId;
    console.log(`[Socket] User disconnected: ${userId}`);

    // Remove from the waiting queue immediately — no grace period needed here
    // since they haven't matched yet.
    waitingQueue = waitingQueue.filter((u) => u.socket.id !== socket.id);

    // If the user has another active socket (e.g. from a fast page reload or strict-mode
    // where the new socket connected before the old socket's disconnect event fired),
    // skip the timer completely so we don't accidentally kill their ongoing session.
    const sockets = await io.fetchSockets();
    const hasActiveSocket = sockets.some((s) => s.userId === userId && s.id !== socket.id);

    if (hasActiveSocket) {
      console.log(`[Socket] User ${userId} has another active socket. Skipping cleanup timer.`);
      return;
    }

    // Defer the active-conversation cleanup by 10s to survive transient network blips.
    const timer = setTimeout(async () => {
      disconnectTimers.delete(userId);
      try {
        const activeConversation = await Conversation.findOneAndUpdate(
          { participants: userId, isActive: true },
          { isActive: false },
          { new: true }
        );

        if (activeConversation) {
          const roomId = activeConversation._id.toString();
          // Notify the partner that the user has truly left
          socket.to(roomId).emit("partner-disconnected");
          console.log(`[Socket] Closed conversation ${roomId} after grace period for ${userId}`);

          // Update recentPartners for both sides
          const partnerIdFromConv = activeConversation.participants
            .find((p) => p.toString() !== userId)?.toString();
          if (partnerIdFromConv) {
            addRecentPartner(socket, partnerIdFromConv);
            // Find the partner's live socket to update their list too
            const allSockets = await io.fetchSockets();
            const partnerSocket = allSockets.find((s) => s.userId === partnerIdFromConv);
            if (partnerSocket) addRecentPartner(partnerSocket, userId);
          }

          // Schedule deletion after 15 min so a report filed during the grace period
          // can still cancel deletion and preserve messages for review.
          scheduleMessageDeletion(activeConversation._id);
        }
      } catch (err) {
        console.error("[Socket] Error during deferred disconnect cleanup:", err.message);
      }
    }, 10_000);

    disconnectTimers.set(userId, timer);
  });
};

export default registerMatchHandlers;