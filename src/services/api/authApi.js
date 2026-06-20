import { API_BASE_URL } from "../../constants/config.js";
import { getToken } from "../../utils/token.js";

/**
 * Internal helper — wraps fetch with JSON content-type and handles
 * non-OK responses by throwing an error with the server's message.
 */
const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data;
};

/**
 * Sends a signup request.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, data: { message: string } }>}
 */
export const signup = (email, password) =>
  request("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/**
 * Sends a login request.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, data: { token: string } }>}
 */
export const login = (email, password) =>
  request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
