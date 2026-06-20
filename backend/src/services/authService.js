import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const SALT_ROUNDS = 10;

/**
 * Registers a new user.
 * @param {string} email
 * @param {string} password
 * @returns {{ message: string }}
 * @throws {Error} with statusCode if validation fails
 */
export const signup = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  return { message: "Account created successfully" };
};

/**
 * Authenticates a user and returns a signed JWT.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string }}
 * @throws {Error} with statusCode on invalid credentials
 */
export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user._id });
  return { token };
};
