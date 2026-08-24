import User from "../models/User.js";

/**
 * Middleware that runs AFTER authenticateToken.
 * Verifies that the authenticated user has isAdmin: true.
 * Returns 403 if not an admin or user not found.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default requireAdmin;
