import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  handleSignup,
  handleLogin,
  handleVerifyEmail,
  handleResendVerification,
  handleRefresh,
  handleLogout,
  handleReport,
  handleAcceptTerms,
} from "../controllers/authController.js";
import authenticateToken from "../middleware/auth.js";

const router = Router();

// Rate limiter for login: max 10 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});

// Rate limiter for signup: max 5 attempts per IP per hour
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this IP, please try again later" },
});

router.post("/signup", signupLimiter, handleSignup);
router.post("/login", loginLimiter, handleLogin);
router.post("/refresh", handleRefresh);
router.post("/logout", handleLogout);
router.get("/verify-email", handleVerifyEmail);
router.post("/resend-verification", handleResendVerification);
router.post("/report", authenticateToken, handleReport);
router.post("/accept-terms", authenticateToken, handleAcceptTerms);

export default router;
