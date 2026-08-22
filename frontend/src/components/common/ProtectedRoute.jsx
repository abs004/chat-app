import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wraps routes that require authentication.
 * Renders the child if a token exists; redirects to /login otherwise.
 * This eliminates the useEffect-based redirect pattern in page components
 * which caused a visible flash before redirecting.
 */
const ProtectedRoute = ({ children, requireTerms = true }) => {
  const { token } = useAuth();
  
  if (!token) return <Navigate to="/login" replace />;

  if (requireTerms) {
    const termsAccepted = localStorage.getItem("termsAccepted") === "true";
    if (!termsAccepted) return <Navigate to="/terms" replace />;
  }

  return children;
};

export default ProtectedRoute;
