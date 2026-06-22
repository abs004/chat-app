import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ChatLanding from "./pages/ChatLanding.jsx";
import Chat from "./pages/Chat.jsx";
import VerificationPending from "./pages/VerificationPending.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider wraps everything — provides token, userId, login, logout.
        SocketProvider is inside AuthProvider so it can read the token from context.
      */}
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-pending" element={<VerificationPending />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes — redirect to /login if not authenticated */}
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

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
