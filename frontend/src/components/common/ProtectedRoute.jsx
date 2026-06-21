import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wraps routes that require authentication.
 * Renders the child if a token exists; redirects to /login otherwise.
 * This eliminates the useEffect-based redirect pattern in page components
 * which caused a visible flash before redirecting.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
