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
  // Restrict CORS in production — set CLIENT_ORIGIN in your .env
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default env;
