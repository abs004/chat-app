import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  handleSignup,
  handleLogin,
  handleVerifyEmail,
  handleResendVerification,
} from "../controllers/authController.js";

const router = Router();

// Rate limiter for login: max 10 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
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
router.get("/verify-email", handleVerifyEmail);
router.post("/resend-verification", handleResendVerification);

export default router;
