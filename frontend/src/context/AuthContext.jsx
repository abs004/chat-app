import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
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
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem("avatarSeed") || "default");

  // Ref so the refresh logic always reads the latest logout without stale closure.
  const logoutRef = useRef(null);

  /**
   * isInitializing: true while we're checking whether the stored access token
   * is still valid on app boot. ProtectedRoute renders nothing until this is false,
   * preventing the redirect-to-login flash when a valid refresh token exists.
   */
  const [isInitializing, setIsInitializing] = useState(true);

  /** Stores the token, updates userId, isAdmin, avatarSeed, and refreshToken from the login response. */
  const login = useCallback((newToken, adminFlag = false, seed = "default", refreshToken = null) => {
    setToken(newToken);
    setTokenState(newToken);
    setUserId(getStoredUserId());
    const isAdminBool = Boolean(adminFlag);
    localStorage.setItem("isAdmin", isAdminBool ? "true" : "false");
    setIsAdmin(isAdminBool);
    localStorage.setItem("avatarSeed", seed);
    setAvatarSeed(seed);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }, []);

  /** Updates the user's avatar seed locally. */
  const updateAvatarSeed = useCallback((seed) => {
    localStorage.setItem("avatarSeed", seed);
    setAvatarSeed(seed);
  }, []);

  /** Clears auth state and removes all auth tokens from storage. */
  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserId(null);
    setIsAdmin(false);
    setAvatarSeed("default");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("termsAccepted");
    localStorage.removeItem("avatarSeed");
    localStorage.removeItem("refreshToken");
    // Best-effort: notify the server (no-op today, reserved for token revocation).
    fetch(`${API_BASE_URL}/logout`, { method: "POST" }).catch(() => {});
  }, []);

  // Keep the ref in sync so refresh logic always calls the latest logout.
  logoutRef.current = logout;

  /**
   * On mount: check whether the stored access token is still valid.
   * If it is expired (or missing) but a refreshToken exists, exchange it
   * silently so the user does not see a login redirect on app reopen.
   */
  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = getToken();
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (existingToken) {
        // Decode to check expiry without a network call.
        try {
          const parts = existingToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            const expiresAt = payload.exp * 1000;
            // Token still has more than 30 seconds of life — treat as valid.
            if (Date.now() < expiresAt - 30_000) {
              setIsInitializing(false);
              return;
            }
          }
        } catch {
          // Malformed token — fall through to refresh attempt.
        }
      }

      // Access token is absent or expired. Try the refresh token.
      if (storedRefreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data?.data?.token ?? data?.token;
            const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken;

            if (newToken) {
              setToken(newToken);
              setTokenState(newToken);
              setUserId(getStoredUserId());
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }
            } else {
              // Refresh response was OK but malformed — clear everything.
              logoutRef.current?.();
            }
          } else {
            // Refresh token is expired or invalid — clear everything.
            logoutRef.current?.();
          }
        } catch {
          // Network error during bootstrap — leave tokens as-is and let the
          // user proceed; individual API calls will retry or redirect to login.
        }
      } else if (!existingToken) {
        // No tokens at all — nothing to restore.
      }

      setIsInitializing(false);
    };

    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) throw new Error("No refresh token stored");

        const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const data = await refreshRes.json();
        const newToken = data?.data?.token ?? data?.token;
        const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken;

        if (!newToken) throw new Error("No token in refresh response");

        // Persist the new tokens and update state
        setToken(newToken);
        setTokenState(newToken);
        setUserId(getStoredUserId());
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

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
    <AuthContext.Provider value={{ token, userId, isAdmin, avatarSeed, isInitializing, login, logout, updateAvatarSeed, authenticatedFetch: authFetch }}>
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