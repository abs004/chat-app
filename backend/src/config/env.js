/**
 * Centralized environment configuration.
 * All env variables are read and validated here so the rest of the app
 * never calls process.env directly.
 */

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),
  // Restrict CORS in production — set CLIENT_ORIGIN in your .env
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  NODE_ENV: process.env.NODE_ENV || "development",

  // ── Email (Nodemailer) ────────────────────────────────────────────────────
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "CampusChat <noreply@campuschat.app>",

  // ── App URL (used to build verification links) ───────────────────────────
  APP_URL: process.env.APP_URL || "http://localhost:5173",
};

export default env;
