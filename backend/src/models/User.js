import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    hasAcceptedTerms: {
      type: Boolean,
      default: false,
    },
    avatarSeed: {
      type: String,
      default: "default",
    },
    // ── Ban / Admin ──────────────────────────────────────────────────────────
    isBanned: {
      type: Boolean,
      default: false,
    },
    // null = permanent ban; a Date = ban lifts at that time
    banExpiresAt: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // ── Password Reset ───────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    // ── Ban History ──────────────────────────────────────────────────────────
    banHistory: [
      {
        duration: { type: String }, // "1d", "7d", "permanent"
        reason: { type: String },   // optional note
        bannedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
