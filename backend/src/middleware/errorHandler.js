import env from "../config/env.js";

/**
 * Global Express error-handling middleware.
 * Must be registered LAST (after all routes) in app.js.
 *
 * Any route can call next(err) or throw an error and it will end up here,
 * producing a consistent error response without repeating try/catch in every handler.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log full error in development, abbreviated in production
  if (env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${message}`);
  }

  res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
