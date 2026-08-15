import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import profileRoutes from "./routes/profile.js";
import errorHandler from "./middleware/errorHandler.js";

/**
 * Creates and configures the Express application.
 * Keeping this separate from server startup allows the app
 * to be imported and tested independently.
 */
const createApp = () => {
  const app = express();

  // ── Middleware ────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,               // allow cookies on cross-origin requests
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({ success: true, message: "ChatApp API is running" });
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use("/", authRoutes);
  app.use("/messages", messageRoutes);
  app.use("/profile", profileRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
