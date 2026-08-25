import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ChatLanding from "./pages/ChatLanding.jsx";
import Chat from "./pages/Chat.jsx";
import VerificationPending from "./pages/VerificationPending.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import Admin from "./pages/Admin.jsx";
import Settings from "./pages/Settings.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

const RootLayout = () => (
  <AuthProvider>
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  </AuthProvider>
);

/** Guard for admin-only routes — redirects non-admins to /chat-landing. */
const AdminRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) return <Navigate to="/chat-landing" replace />;
  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-pending" element={<VerificationPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route
        path="/terms"
        element={
          <ProtectedRoute requireTerms={false}>
            <TermsOfUse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-landing"
        element={
          <ProtectedRoute>
            <ChatLanding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}

