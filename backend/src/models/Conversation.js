import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // ── Report tracking ──────────────────────────────────────────────────────
    reported: {
      type: Boolean,
      default: false,
    },
    reportedAt: {
      type: Date,
      default: null,
    },
    // Tracks when the 15-minute deletion grace period started after a report
    deletionScheduledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index participants for efficient lookup of active conversations per user
conversationSchema.index({ participants: 1, isActive: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
