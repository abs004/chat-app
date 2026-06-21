/**
 * Token utility functions.
 * Centralizes all localStorage access and JWT decoding so no component
 * ever reads localStorage or decodes JWTs directly.
 */

const TOKEN_KEY = "token";

/** Retrieves the stored auth token, or null if not present. */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Persists the auth token. */
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

/** Removes the auth token (logout). */
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Verification happens on the server — this is for reading client-side claims only.
 * @returns {object|null} decoded payload, or null on failure
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/** Returns the userId from the stored token, or null. */
export const getStoredUserId = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.userId ?? null;
};
