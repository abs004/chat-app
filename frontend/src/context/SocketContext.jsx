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

// Initialize socket synchronously so children's effects
// see socketRef.current already set on first mount/reload
if (token && !socketRef.current) {
  socketRef.current = connectSocket(token);
  updateSocketToken(token);
}

 useEffect(() => {
  if (!token) {
    disconnectSocket();
    socketRef.current = null;
  } else {
    updateSocketToken(token);
  }
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
