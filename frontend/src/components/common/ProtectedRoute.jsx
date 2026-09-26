import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wraps routes that require authentication.
 * Returns null (blank screen) while auth initialization is in progress.
 * Once ready: renders the child if a valid token exists, redirects to /login otherwise.
 */
const ProtectedRoute = ({ children, requireTerms = true }) => {
  const { token, authReady } = useAuth();

  // Prevent any render decision until the startup token check / silent refresh finishes.
  if (!authReady) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (requireTerms) {
    const termsAccepted = localStorage.getItem("termsAccepted") === "true";
    if (!termsAccepted) return <Navigate to="/terms" replace />;
  }

  return children;
};

export default ProtectedRoute;
