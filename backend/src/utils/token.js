import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Signs a JWT for the given payload.
 * @param {object} payload
 * @returns {string} signed token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

/**
 * Verifies and decodes a JWT.
 * Throws if token is invalid or expired.
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
