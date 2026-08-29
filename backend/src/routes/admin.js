import { Router } from "express";
import authenticateToken from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  handleGetStats,
  handleGetReports,
  handleGetReportMessages,
  handleUpdateReportStatus,
  handleGetUsers,
  handleBanUser,
  handleUnbanUser,
  handleGetUserReports,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes are protected by both authentication and admin check
router.use(authenticateToken, requireAdmin);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", handleGetStats);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get("/reports", handleGetReports);
router.get("/reports/:conversationId/messages", handleGetReportMessages);
router.patch("/reports/:reportId", handleUpdateReportStatus);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", handleGetUsers);
router.patch("/users/:userId/ban", handleBanUser);
router.patch("/users/:userId/unban", handleUnbanUser);
router.get("/users/:userId/reports", handleGetUserReports);

export default router;
