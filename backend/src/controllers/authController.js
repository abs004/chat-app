import jwt from "jsonwebtoken";
import { signup, login, verifyEmail, resendVerification } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import env from "../config/env.js";
import Report from "../models/Report.js";
import Conversation from "../models/Conversation.js";
import { cancelMessageDeletion } from "../utils/messageCleanup.js";
import { sendEmail } from "../services/emailService.js";
import User from "../models/User.js";

const ALLOWED_DOMAIN = "@gecskp.ac.in";

/** 7 days in milliseconds — lifetime of the refresh token cookie. */
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Shared cookie options for the refresh token.
 * httpOnly prevents JS access; secure ensures HTTPS-only in production.
 */
const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  path: "/",
};

/**
 * POST /signup
 * Validates input, enforces college domain, delegates to authService.signup.
 */
export const handleSignup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      return res
        .status(403)
        .json({ success: false, message: "Registration is only open to @gecskp.ac.in email addresses" });
    }

    const result = await signup(email, password);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /login
 * Validates input, delegates to authService.login, then issues:
 *   - A short-lived access token (15 min) in the response body.
 *   - A long-lived refresh token (7 days) in an httpOnly cookie.
 */
export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // authService.login validates credentials and returns { token }
    // (the access token already signed via signToken / env.JWT_EXPIRES_IN = "15m")
    const result = await login(email, password);

    // Extract the userId from the freshly minted access token
    const { userId } = jwt.decode(result.token);

    const user = await User.findById(userId);
    if (!user.hasAcceptedTerms) {
      result.hasAcceptedTerms = false;
    }
    result.isAdmin = user.isAdmin;
    result.avatarSeed = user.avatarSeed;

    // Issue a separate, longer-lived refresh token and store it in an httpOnly cookie.
    const refreshToken = jwt.sign(
      { userId },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    // Return only the access token in the body — never the refresh token.
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/refresh
 * Reads the refresh token from the httpOnly cookie, verifies it with
 * REFRESH_TOKEN_SECRET, then issues a brand-new access token.
 * Stateless — no DB lookup required.
 */
export const handleRefresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token is invalid or expired" });
    }

    if (!decoded?.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Malformed refresh token" });
    }

    const { signToken } = await import("../utils/token.js");
    const newAccessToken = signToken({ userId: decoded.userId });

    return sendSuccess(res, { token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 * Clears the refresh token cookie. The client is responsible for
 * discarding the access token from memory.
 */
export const handleLogout = (_req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * GET /verify-email?token=<token>
 * Accepts a verification token, validates it, and marks the user as verified.
 */
export const handleVerifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is required" });
    }

    const result = await verifyEmail(token);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /resend-verification
 * Issues a new verification token and resends the email.
 * Always returns the same generic message to prevent account enumeration.
 */
export const handleResendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const result = await resendVerification(email);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /report
 * Submits a report against a user from a specific conversation.
 * Cancels message deletion to preserve evidence, and notifies the admin.
 */
export const handleReport = async (req, res, next) => {
  try {
    const { reportedUserId, conversationId, reason, description } = req.body;
    const reporterId = req.user.userId;

    if (!reportedUserId || !conversationId || !reason) {
      return res.status(400).json({ message: "reportedUserId, conversationId, and reason are required" });
    }

    const allowedReasons = ["harassment", "impersonation", "spam", "inappropriate", "other"];
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ message: "Invalid reason provided" });
    }

    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(403).json({ message: "Conversation not found" });
    }

    // Verify reporter is a participant
    if (!conversation.participants.some((p) => p.toString() === reporterId)) {
      return res.status(403).json({ message: "You are not a participant of this conversation" });
    }

    if (conversation.reported) {
      return res.status(400).json({ message: "This conversation has already been reported" });
    }

    // Create report
    const report = new Report({
      reporter: reporterId,
      reported: reportedUserId,
      conversationId,
      reason,
      description,
    });
    await report.save();

    // Mark conversation as reported
    conversation.reported = true;
    conversation.reportedAt = new Date();
    await conversation.save();

    // Preserve messages for admin review
    cancelMessageDeletion(conversationId);

    // Notify admin
    const emailBody = `
      <h2 style="color:#f9fafb;margin-top:0;">New Report Submitted</h2>
      <p style="color:#9ca3af;font-size:15px;line-height:1.6;">
        <strong>Reporter ID:</strong> ${reporterId}<br/>
        <strong>Reported User ID:</strong> ${reportedUserId}<br/>
        <strong>Conversation ID:</strong> ${conversationId}<br/>
        <strong>Reason:</strong> ${reason}<br/>
        <strong>Description:</strong> ${description || "<em>No description provided</em>"}<br/>
        <strong>Timestamp:</strong> ${new Date().toUTCString()}
      </p>
    `;

    sendEmail({
      to: env.ADMIN_EMAIL,
      subject: "New Report Submitted — G-Chat",
      bodyHtml: emailBody,
    })
      .catch(err => console.error("[Report] Failed to send admin email:", err.message));

    return res.status(201).json({ message: "Report submitted. We will review it shortly." });
  } catch (error) {
    console.error("[Report] Error handling report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /accept-terms
 * Marks the user as having accepted the terms of use.
 */
export const handleAcceptTerms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndUpdate(userId, { hasAcceptedTerms: true });
    return res.status(200).json({ message: "Terms accepted" });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /avatar
 * Updates the user's avatarSeed.
 */
export const handleUpdateAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { avatarSeed } = req.body;

    if (!avatarSeed || typeof avatarSeed !== "string" || avatarSeed.trim() === "" || avatarSeed.length > 50) {
      return res.status(400).json({ message: "Invalid avatarSeed provided" });
    }

    await User.findByIdAndUpdate(userId, { avatarSeed: avatarSeed.trim() });
    return res.status(200).json({ message: "Avatar updated", avatarSeed: avatarSeed.trim() });
  } catch (err) {
    next(err);
  }
};
