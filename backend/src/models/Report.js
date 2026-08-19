import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Report schema — records a user's report against another user
 * for content from a specific conversation.
 *
 * status lifecycle: pending → reviewed | dismissed
 */
const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reported: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  reason: {
    type: String,
    enum: ["harassment", "impersonation", "spam", "inappropriate", "other"],
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Efficient lookups for the admin dashboard
reportSchema.index({ reported: 1, status: 1 });
reportSchema.index({ conversationId: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
