import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emailService.js";
import env from "../config/env.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generates a cryptographically secure hex token and its expiry timestamp.
 */
const generateVerificationToken = () => ({
  token: crypto.randomBytes(32).toString("hex"),
  expires: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
});

/**
 * Registers a new user. Creates the account in an unverified state and
 * fires a verification email.
 * @param {string} email
 * @param {string} password
 * @returns {{ message: string }}
 */
export const signup = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const { token, expires } = generateVerificationToken();
  const avatarSeed = crypto.randomBytes(8).toString("hex");

  const user = new User({
    email,
    password: hashedPassword,
    avatarSeed,
    isVerified: false,
    verificationToken: token,
    verificationTokenExpires: expires,
  });
  await user.save();

  // Fire-and-forget — don't block the response on email delivery
  sendVerificationEmail(email, token).catch((err) => {
    console.error("[emailService] Failed to send verification email:", err.message);
  });

  return { message: "Account created. Please check your email to verify your account." };
};

/**
 * Authenticates a user and returns a signed JWT.
 * Rejects unverified accounts before issuing any token.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string }}
 */
export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isVerified) {
    const err = new Error("Please verify your email before logging in.");
    err.statusCode = 403;
    throw err;
  }

  // ── Ban Check ─────────────────────────────────────────────────────────────
  if (user.isBanned) {
    if (user.banExpiresAt === null) {
      const err = new Error("Your account has been permanently suspended due to violations of our community guidelines.");
      err.statusCode = 403;
      throw err;
    } else if (user.banExpiresAt > new Date()) {
      const dateStr = user.banExpiresAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = user.banExpiresAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const err = new Error(`Your account is temporarily suspended until ${dateStr}, ${timeStr}. Please try again after that.`);
      err.statusCode = 403;
      throw err;
    } else {
      // Ban has expired — lift it automatically
      await User.findByIdAndUpdate(user._id, { isBanned: false, banExpiresAt: null });
    }
  }

  const token = signToken({ userId: user._id, email: user.email });
  return { token };
};

/**
 * Verifies an email using the token from the verification link.
 * Token is single-use — cleared immediately after verification.
 * @param {string} token - raw hex token from query param
 * @returns {{ message: string }}
 */
export const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }, // not expired
  });

  if (!user) {
    const err = new Error("Verification link is invalid or has expired.");
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return { message: "Email verified successfully. You can now log in." };
};

/**
 * Resends a verification email.
 * Returns the same message regardless of whether the email exists
 * to prevent account enumeration.
 * @param {string} email
 * @returns {{ message: string }}
 */
export const resendVerification = async (email) => {
  const GENERIC_RESPONSE = {
    message: "If that email is registered and unverified, a new link has been sent.",
  };

  const user = await User.findOne({ email });

  // Silently ignore unknown emails or already-verified accounts
  if (!user || user.isVerified) {
    return GENERIC_RESPONSE;
  }

  const { token, expires } = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpires = expires;
  await user.save();

  // Fire-and-forget — don't block or fail the response on email delivery.
  // Mirrors the same pattern used in signup().
  sendVerificationEmail(email, token).catch((err) => {
    console.error("[emailService] Failed to resend verification email:", err.message);
  });

  return GENERIC_RESPONSE;
};

/**
 * Sends a password reset link to the given email.
 * Always returns a generic message to prevent email enumeration.
 * @param {string} email
 * @returns {{ message: string }}
 */
export const forgotPassword = async (email) => {
  const GENERIC_RESPONSE = {
    message: "If that email exists, a reset link has been sent.",
  };

  const user = await User.findOne({ email });
  // Silently ignore unknown emails to prevent enumeration
  if (!user) return GENERIC_RESPONSE;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;

  // Fire-and-forget — don't block the response on email delivery
  sendPasswordResetEmail(email, resetUrl).catch((err) => {
    console.error("[emailService] Failed to send password reset email:", err.message);
  });

  return GENERIC_RESPONSE;
};

/**
 * Resets a user's password using the raw token from the reset link.
 * @param {string} rawToken - raw hex token from URL query param
 * @param {string} newPassword
 * @returns {{ message: string }}
 */
export const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error("Reset link is invalid or has expired");
    err.statusCode = 400;
    throw err;
  }

  if (!newPassword || newPassword.length < 8) {
    const err = new Error("Password must be at least 8 characters");
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return { message: "Password reset successfully. You can now log in." };
};
