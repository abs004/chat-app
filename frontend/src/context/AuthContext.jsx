import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
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

  // Ref so the interceptor always reads the latest logout without stale closure.
  const logoutRef = useRef(null);

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
    // Best-effort: tell the server to clear the httpOnly refresh cookie.
    axios.post("/logout").catch(() => {});
  }, []);

  // Keep the ref in sync so the interceptor below always calls the latest logout.
  logoutRef.current = logout;

  /**
   * Axios interceptor — silent refresh on 401.
   *
   * On any 401 response:
   *   1. Call POST /refresh (server reads httpOnly cookie, issues new access token).
   *   2. Store the new access token and retry the original request once.
   *   3. If /refresh itself returns 401, log the user out.
   *
   * `_isRetry` on the config object prevents infinite retry loops.
   */
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401; skip if this is already a retry or a
        // refresh/login/logout request itself (prevents infinite loops).
        const isAuthRoute =
          originalRequest.url?.includes("/refresh") ||
          originalRequest.url?.includes("/login") ||
          originalRequest.url?.includes("/logout");

        if (error.response?.status === 401 && !originalRequest._isRetry && !isAuthRoute) {
          originalRequest._isRetry = true;

          try {
            // Ask the server to issue a new access token using the httpOnly cookie.
            const { data } = await axios.post("/refresh", {}, { withCredentials: true });
            const newToken = data?.data?.token;

            if (!newToken) throw new Error("No token in refresh response");

            // Persist the new token and update the Authorization header.
            setToken(newToken);
            setTokenState(newToken);
            setUserId(getStoredUserId());

            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch {
            // Refresh failed — force logout.
            logoutRef.current?.();
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up the interceptor when the provider unmounts.
    return () => axios.interceptors.response.eject(interceptorId);
  }, []); // runs once on mount

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
