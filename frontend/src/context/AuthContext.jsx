import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { API_BASE_URL } from "../constants/config.js";
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

  // Ref so the refresh logic always reads the latest logout without stale closure.
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
    fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  // Keep the ref in sync so refresh logic always calls the latest logout.
  logoutRef.current = logout;

  /**
   * Monkey-patch fetch to silently refresh the access token on 401.
   *
   * On any 401 response:
   *   1. Call POST /auth/refresh (server reads httpOnly cookie, issues new access token).
   *   2. Store the new access token and retry the original request once.
   *   3. If /refresh itself returns 401, log the user out.
   *
   * `_isRetry` flag on the request URL prevents infinite retry loops.
   */
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input?.url ?? "";

      // Skip intercepting auth routes to prevent infinite loops
      const isAuthRoute =
        url.includes("/refresh") ||
        url.includes("/login") ||
        url.includes("/logout");

      const response = await originalFetch(input, init);

      if (response.status === 401 && !init._isRetry && !isAuthRoute) {
        try {
          // Ask the server for a new access token using the httpOnly cookie
          const refreshRes = await originalFetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!refreshRes.ok) throw new Error("Refresh failed");

          const data = await refreshRes.json();
          const newToken = data?.token;

          if (!newToken) throw new Error("No token in refresh response");

          // Persist the new token and update state
          setToken(newToken);
          setTokenState(newToken);
          setUserId(getStoredUserId());

          // Retry the original request with the new token
          const retryInit = {
            ...init,
            _isRetry: true,
            headers: {
              ...(init.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
          };

          return originalFetch(input, retryInit);
        } catch {
          // Refresh failed — force logout
          logoutRef.current?.();
        }
      }

      return response;
    };

    // Restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
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