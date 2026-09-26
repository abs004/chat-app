import { io } from "socket.io-client";
import { API_BASE_URL } from "../../constants/config.js";
import { setToken } from "../../utils/token.js";
import { silentRefresh } from "../../context/AuthContext.jsx";

/**
 * Singleton Socket.IO service.
 *
 * Manages a single shared socket instance for the application lifetime.
 * Using a singleton prevents multiple connections being created when
 * components re-render or the user navigates between pages.
 */
let socket = null;
let isRefreshing = false;

/**
 * Creates and connects the socket if not already connected.
 * Attaches a connect_error handler that auto-refreshes the JWT via
 * localStorage refreshToken when the server rejects the connection
 * due to an expired/invalid token.
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

    // Also skip banned errors — SocketContext's 'banned' handler covers those.
    const isBanError = err.message?.toLowerCase().startsWith("banned:");

    if (!isAuthError || isBanError || isRefreshing) return;

    isRefreshing = true;

    try {
      // Use the shared silentRefresh helper (reads from localStorage, POSTs
      // to /refresh with body, stores the new access token).
      const newToken = await silentRefresh();

      // Update the socket's auth so the next handshake uses the fresh token.
      socket.auth.token = newToken;

      // Manually reconnect now that the token is updated.
      socket.connect();
    } catch {
      // Refresh failed — the session is truly expired.
      // Tear down the socket and call the logout registered by AuthContext
      // so the full auth state cleanup runs in one place.
      console.warn("[Socket] Token refresh failed. Logging out.");
      disconnectSocket();
      // Trigger the AuthContext logout via the window bridge set by SocketContext.
      if (typeof window.__authLogout === "function") {
        window.__authLogout();
      } else {
        // Fallback: hard redirect if the bridge isn't wired yet.
        window.location.href = "/login";
      }
    } finally {
      isRefreshing = false;
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
