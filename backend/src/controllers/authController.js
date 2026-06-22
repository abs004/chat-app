import { signup, login, verifyEmail, resendVerification } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

const ALLOWED_DOMAIN = "@gecskp.ac.in";

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
 * Validates input and delegates to authService.login.
 */
export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const result = await login(email, password);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
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
