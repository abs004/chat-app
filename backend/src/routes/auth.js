import { Router } from "express";
import {
  handleSignup,
  handleLogin,
  handleVerifyEmail,
  handleResendVerification,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.get("/verify-email", handleVerifyEmail);
router.post("/resend-verification", handleResendVerification);

export default router;
