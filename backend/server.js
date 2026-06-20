import "dotenv/config";
import http from "http";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";
import createApp from "./src/app.js";
import initSocket from "./src/sockets/index.js";

// Connect to MongoDB before starting the server
await connectDB();

const app = createApp();
const httpServer = http.createServer(app);

// Initialize Socket.IO (attaches to the same HTTP server as Express)
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`[Server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
});

