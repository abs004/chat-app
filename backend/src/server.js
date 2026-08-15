import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
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
  .then(() => {
    console.log("[DB] MongoDB connected");

    // Start listening only after the DB connection is ready
    server.listen(env.PORT, () => {
      console.log(`[Server] Listening on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("[DB] Connection failed:", err.message);
    process.exit(1);
  });
