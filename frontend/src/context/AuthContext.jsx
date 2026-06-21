import { createContext, useContext, useState, useCallback } from "react";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUserId,
} from "../utils/token.js";

/**
 * AuthContext provides authentication state across the entire app.
 * Components read userId / token and call login / logout without
 * touching localStorage or decoding JWTs themselves.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [userId, setUserId] = useState(() => getStoredUserId());

  /** Stores the token and updates userId from its payload. */
  const login = useCallback((newToken) => {
    setToken(newToken);
    setTokenState(newToken);
    setUserId(getStoredUserId());
  }, []);

  /** Clears auth state and removes the token from storage. */
  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook — components use this instead of useContext(AuthContext). */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
