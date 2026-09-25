import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import profileRoutes from "./routes/profile.js";
import adminRoutes from "./routes/admin.js";
import errorHandler from "./middleware/errorHandler.js";

/**
 * Creates and configures the Express application.
 * Keeping this separate from server startup allows the app
 * to be imported and tested independently.
 */
const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);
  // ── Middleware ────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      // Allow requests from the Vercel frontend AND requests with no Origin header.
      // When Vercel proxies /api/* to Render, the hop is server-to-server and the
      // Origin header may be absent — we must permit that for the proxy to work.
      origin: (origin, callback) => {
        const allowed = [env.CLIENT_ORIGIN];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,               // allow cookies on cross-origin requests
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
  app.use("/admin", adminRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
