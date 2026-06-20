import { signup, login } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * POST /signup
 * Validates input and delegates to authService.signup.
 */
export const handleSignup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
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
