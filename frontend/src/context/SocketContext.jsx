import { createContext, useContext, useEffect, useRef } from "react";
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
  const { token } = useAuth();
  // Use a ref so socket consumers always get the current instance
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      // Connect (or reuse existing connection) when authenticated
      socketRef.current = connectSocket(token);
      // Always sync the token on the existing socket so reconnects use the
      // latest credentials — this covers HTTP-layer refreshes via authFetch.
      updateSocketToken(token);
    } else {
      // Disconnect when logged out
      disconnectSocket();
      socketRef.current = null;
    }

    return () => {
      // Cleanup only on full unmount (app teardown), not on token change
    };
  }, [token]);

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
