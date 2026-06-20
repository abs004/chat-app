import { Router } from "express";
import authenticateToken from "../middleware/auth.js";
import { handleGetMessages } from "../controllers/messageController.js";

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

router.get("/:conversationId", handleGetMessages);

export default router;
