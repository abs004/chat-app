import mongoose from "mongoose";
import env from "./env.js";

/**
 * Connects to MongoDB using the URI from environment config.
 * Exits the process on failure so the app doesn't run without a DB.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("[DB] MongoDB connected");
  } catch (err) {
    console.error("[DB] MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
