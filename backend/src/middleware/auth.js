import { verifyToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";
import { checkBanStatus } from "../utils/banCheck.js";

/**
 * HTTP authentication middleware.
 * Reads the Bearer token from the Authorization header, verifies it,
 * checks the live ban status, and attaches the decoded payload to req.user.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return sendError(res, "Access denied: no token provided", 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return sendError(res, "Invalid or expired token", 403);
  }

  // Re-check ban status on every request so bans take effect immediately
  // without waiting for the access token to expire.
  try {
    const { banned, message } = await checkBanStatus(decoded.userId);
    if (banned) return sendError(res, message, 403);
  } catch {
    // If the DB is unreachable, fail open (don't block legitimate traffic)
  }

  req.user = decoded;
  next();
};

export default authenticateToken;
