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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
