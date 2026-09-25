import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wraps routes that require authentication.
 * Renders the child if a token exists; redirects to /login otherwise.
 * Returns null while the auth bootstrap is still running (silently exchanging
 * an expired access token via the refresh token) to prevent a false redirect.
 */
const ProtectedRoute = ({ children, requireTerms = true }) => {
  const { token, isInitializing } = useAuth();

  // Hold until the initial token check / silent refresh is complete.
  if (isInitializing) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (requireTerms) {
    const termsAccepted = localStorage.getItem("termsAccepted") === "true";
    if (!termsAccepted) return <Navigate to="/terms" replace />;
  }

  return children;
};

export default ProtectedRoute;
