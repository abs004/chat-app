import { io } from "socket.io-client";
import { API_BASE_URL } from "../../constants/config.js";

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
 * @param {string} token - JWT auth token sent in the handshake
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
    // Reconnect automatically on network interruption
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
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
