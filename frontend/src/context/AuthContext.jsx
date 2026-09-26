import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { API_BASE_URL } from "../constants/config.js";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUserId,
  isTokenExpired,
} from "../utils/token.js";

/**
 * AuthContext provides authentication state across the entire app.
 * Components read userId / token and call login / logout without
 * touching localStorage or decoding JWTs themselves.
 *
 * authReady: false while the startup token-validation / silent-refresh
 * is in progress. Protected routes must wait for authReady before
 * deciding whether to render or redirect, preventing the flash of
 * content (or premature redirect to /login) on page reload.
 */
const AuthContext = createContext(null);

/**
 * Performs a silent token refresh using the stored refreshToken.
 * Returns the new access token on success, or throws on failure.
 * Exported so socketService can reuse the same logic without duplicating it.
 */
export const silentRefresh = async () => {
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

  setToken(newToken);
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }

  return newToken;
};

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [userId, setUserId] = useState(() => getStoredUserId());
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem("avatarSeed") || "default");

  /**
   * authReady starts false and flips to true once the startup check
   * (token still valid OR silent refresh OR confirmed logged-out) completes.
   * Protected routes render null / a spinner until this is true.
   */
  const [authReady, setAuthReady] = useState(false);

  // Ref so the refresh logic always reads the latest logout without stale closure.
  const logoutRef = useRef(null);

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
    // Best-effort: notify the server (reserved for future token revocation).
    fetch(`${API_BASE_URL}/logout`, { method: "POST" }).catch(() => {});
  }, []);

  // Keep the ref in sync so refresh logic always calls the latest logout.
  logoutRef.current = logout;

  // ── Startup auth initialization ────────────────────────────────────────────
  // Runs once on mount. Inspects the stored access token:
  //   - If valid (not expired)   → continue as authenticated.
  //   - If expired/missing       → attempt silent refresh via localStorage refreshToken.
  //   - If refresh also fails    → clear all auth state (treat as logged out).
  // Only sets authReady=true after this process resolves, preventing protected
  // routes from rendering with stale/expired credentials.
  useEffect(() => {
    const initialize = async () => {
      const storedToken = getToken();

      if (storedToken && !isTokenExpired(storedToken)) {
        // Token is still valid — nothing to do.
        setAuthReady(true);
        return;
      }

      // Token is expired or absent — try a silent refresh.
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        // No refresh token either; user is genuinely logged out.
        // Clear any stale access token that might remain.
        if (storedToken) removeToken();
        setTokenState(null);
        setUserId(null);
        setAuthReady(true);
        return;
      }

      try {
        const newToken = await silentRefresh();
        setTokenState(newToken);
        setUserId(getStoredUserId());
      } catch {
        // Silent refresh failed (refresh token expired or server error).
        logoutRef.current?.();
      } finally {
        setAuthReady(true);
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs only once on mount

  /**
   * Wraps fetch with 401 retry logic:
   *   1. Read refreshToken from localStorage and POST to /refresh.
   *   2. Retry the original request with the new access token.
   *   3. Log out if refresh fails.
   */
  const authFetch = useCallback(async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? "";

    // Skip intercepting auth routes to prevent infinite loops
    const isAuthRoute =
      url.includes("/refresh") ||
      url.includes("/login") ||
      url.includes("/logout");

    const response = await fetch(input, init);

    if (response.status === 401 && !init._isRetry && !isAuthRoute) {
      try {
        const newToken = await silentRefresh();

        // Update React state so SocketContext and other consumers stay in sync
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
    <AuthContext.Provider value={{ token, userId, isAdmin, avatarSeed, authReady, login, logout, updateAvatarSeed, authenticatedFetch: authFetch }}>
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