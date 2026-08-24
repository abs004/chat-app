import { createContext, useContext, useState, useCallback, useRef } from "react";
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
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");

  // Ref so the refresh logic always reads the latest logout without stale closure.
  const logoutRef = useRef(null);

  /** Stores the token, updates userId and isAdmin from the login response. */
  const login = useCallback((newToken, adminFlag = false) => {
    setToken(newToken);
    setTokenState(newToken);
    setUserId(getStoredUserId());
    const isAdminBool = Boolean(adminFlag);
    localStorage.setItem("isAdmin", isAdminBool ? "true" : "false");
    setIsAdmin(isAdminBool);
  }, []);

  /** Clears auth state and removes the token from storage. */
  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserId(null);
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("termsAccepted");
    // Best-effort: tell the server to clear the httpOnly refresh cookie.
    fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  // Keep the ref in sync so refresh logic always calls the latest logout.
  logoutRef.current = logout;

  /**
   * Wraps fetch with 401 retry logic:
   *   1. Call POST /refresh to get a new token via httpOnly cookie.
   *   2. Retry original request.
   *   3. Log out if refresh fails.
   */
  const authFetch = useCallback(async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    
    // Skip intercepting auth routes to prevent infinite loops (if accidentally used)
    const isAuthRoute =
      url.includes("/refresh") ||
      url.includes("/login") ||
      url.includes("/logout");

    const response = await fetch(input, init);

    if (response.status === 401 && !init._isRetry && !isAuthRoute) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const data = await refreshRes.json();
        const newToken = data?.data?.token ?? data?.token;

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

        return fetch(input, retryInit);
      } catch {
        // Refresh failed — force logout
        logoutRef.current?.();
      }
    }

    return response;
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, isAdmin, login, logout, authenticatedFetch: authFetch }}>
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