import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatLanding from "./pages/Chat_landing";
// import Chat from "./pages/Chat"; // later

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected landing page after login */}
        <Route path="/chat-landing" element={<ChatLanding />} />

        {/* Protected route later */}
        {/* <Route path="/chat" element={<Chat />} /> */}

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
