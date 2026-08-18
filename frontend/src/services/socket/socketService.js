import { io } from "socket.io-client";
import { API_BASE_URL } from "../../constants/config.js";
import { setToken } from "../../utils/token.js";

/**
 * Singleton Socket.IO service.
 *
 * Manages a single shared socket instance for the application lifetime.
 * Using a singleton prevents multiple connections being created when
 * components re-render or the user navigates between pages.
 */
let socket = null;

/**
 * Creates and connects the socket if not already connected.
 * Attaches a connect_error handler that auto-refreshes the JWT when
 * the server rejects the connection due to an expired/invalid token.
 *
 * @param {string} token - JWT auth token sent in the handshake
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
    // Disable built-in auto-reconnect so we can control it manually
    // after refreshing the token — otherwise Socket.IO retries with the
    // stale token before we get a chance to update socket.auth.
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", async (err) => {
    // Only intercept auth errors — let other errors (network, etc.) be
    // handled by Socket.IO's built-in reconnection logic.
    const isAuthError =
      err.message === "Authentication error" ||
      err.data?.type === "UnauthorizedError" ||
      err.message?.toLowerCase().includes("auth") ||
      err.message?.toLowerCase().includes("token");

    if (!isAuthError) return;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const data = await refreshRes.json();
      const newToken = data?.data?.token ?? data?.token;

      if (!newToken) throw new Error("No token in refresh response");

      // Persist the new token and update the socket's auth so the next
      // handshake uses the fresh token.
      setToken(newToken);
      socket.auth.token = newToken;

      // Manually reconnect now that the token is updated.
      socket.connect();
    } catch {
      // Refresh failed — the session is truly expired.
      // Tear down the socket and redirect to login.
      console.warn("[Socket] Token refresh failed. Redirecting to login.");
      disconnectSocket();
      window.location.href = "/login";
    }
  });

  return socket;
};

/**
 * Updates the token on the existing socket instance.
 * Call this whenever the HTTP layer refreshes the token (e.g. via authFetch)
 * so the socket's next reconnect handshake uses the latest token.
 *
 * @param {string} newToken
 */
export const updateSocketToken = (newToken) => {
  if (socket && newToken) {
    socket.auth.token = newToken;
  }
};

/**
 * Returns the current socket instance (may be null before connectSocket is called).
 * @returns {import('socket.io-client').Socket|null}
 */
export const getSocket = () => socket;

/**
 * Disconnects and cleans up the socket instance.
 * Call this on logout or when the user leaves the chat area.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
