import jwt from "jsonwebtoken";
import { signup, login, verifyEmail, resendVerification } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import env from "../config/env.js";

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

    // Issue a separate, longer-lived refresh token and store it in an httpOnly cookie.
    const refreshToken = jwt.sign(
      { token: result.token }, // embed the access token so we can re-issue it
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

    // Decode the embedded access token to extract userId, then re-sign a fresh one.
    const oldAccess = jwt.decode(decoded.token);
    if (!oldAccess?.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Malformed refresh token" });
    }

    const { signToken } = await import("../utils/token.js");
    const newAccessToken = signToken({ userId: oldAccess.userId });

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
