import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import User from "./models/User.js";
import createApp from "./app.js";
import initSocket from "./sockets/index.js";
import env from "./config/env.js";

// ── Express app ───────────────────────────────────────────────────────────────
const app = createApp();

// ── HTTP server (shared between Express and Socket.IO) ────────────────────────
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
initSocket(server);

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(env.MONGO_URI)
  .then(async () => {
    console.log("[DB] MongoDB connected");

    // One-time startup cleanup: remove unverified accounts created before the
    // server's last restart that never got their in-process timer fired.
    try {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000);
      const { deletedCount } = await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: cutoff },
      });
      if (deletedCount > 0) {
        console.log(`[Startup] Cleaned up ${deletedCount} stale unverified account(s)`);
      }
    } catch (err) {
      console.error("[Startup] Cleanup failed:", err.message);
    }

    // Start listening only after the DB connection is ready
    server.listen(env.PORT, () => {
      console.log(`[Server] Listening on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("[DB] Connection failed:", err.message);
    process.exit(1);
  });
