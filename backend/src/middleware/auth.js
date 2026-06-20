import { verifyToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";

/**
 * HTTP authentication middleware.
 * Reads the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return sendError(res, "Access denied: no token provided", 401);
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 403);
  }
};

export default authenticateToken;
