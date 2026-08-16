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

  // Only attempt JSON parsing when the server says so.
  // Calling res.json() on an HTML error page causes "Unexpected token '<'".
  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    // Non-JSON body (e.g. unexpected HTML from a proxy/CDN/server crash)
    const text = await res.text();
    data = { message: text || "An unexpected error occurred" };
  }

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
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

/**
 * Verifies an email address using the token from the verification link.
 * @param {string} token - raw hex token from URL query param
 * @returns {Promise<{ success: boolean, data: { message: string } }>}
 */
export const verifyEmail = (token) =>
  request(`/verify-email?token=${encodeURIComponent(token)}`);

/**
 * Requests a new verification email to be sent.
 * @param {string} email
 * @returns {Promise<{ success: boolean, data: { message: string } }>}
 */
export const resendVerification = (email) =>
  request("/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

