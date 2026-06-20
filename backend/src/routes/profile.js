import { Router } from "express";
import authenticateToken from "../middleware/auth.js";
import { sendSuccess } from "../utils/response.js";

const router = Router();

/**
 * GET /profile
 * Returns the authenticated user's ID. This is a lightweight identity check
 * endpoint — extend with User.findById when profile data is needed.
 */
router.get("/", authenticateToken, (req, res) => {
  return sendSuccess(res, { userId: req.user.userId });
});

export default router;
