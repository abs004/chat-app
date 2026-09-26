import { createContext, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  updateSocketToken,
} from "../services/socket/socketService.js";

/**
 * SocketContext provides a shared Socket.IO instance to consumers.
 * The connection is established when the user is authenticated
 * and torn down on logout, ensuring the lifecycle is tied to auth state.
 */
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, authReady, logout } = useAuth();
  const navigate = useNavigate();
  // Use a ref so socket consumers always get the current instance
  const socketRef = useRef(null);

  // Connect / disconnect the socket in response to auth state changes.
  // Gated on authReady so we never connect with an expired token that
  // AuthContext hasn't had a chance to refresh yet.
  useEffect(() => {
    if (!authReady) return; // wait for startup validation to finish

    if (!token) {
      // User logged out or refresh failed — tear down any existing socket.
      disconnectSocket();
      socketRef.current = null;
      return;
    }

    // authReady=true and token is valid — connect (or reuse) the socket.
    if (!socketRef.current) {
      socketRef.current = connectSocket(token);
    } else {
      // Socket already exists (e.g. token was silently refreshed) — just
      // update the auth token so the next reconnect handshake uses it.
      updateSocketToken(token);
    }
  }, [authReady, token]);

  // Expose logout on window so socketService can trigger auth cleanup
  // without creating a circular import (socketService → AuthContext).
  useEffect(() => {
    window.__authLogout = () => {
      logout();
      navigate("/login", { replace: true });
    };
    return () => { window.__authLogout = null; };
  }, [logout, navigate]);

  // Listen for the server-initiated 'banned' event.
  // When received, run full auth cleanup and redirect to login.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onBanned = () => {
      logout();
      navigate("/login", { replace: true });
    };

    socket.on("banned", onBanned);
    return () => socket.off("banned", onBanned);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Returns the current socket ref.
 * Access the live socket via socketRef.current.
 */
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

export default SocketContext;
