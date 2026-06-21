import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatLanding() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#0d4d3d] to-[#1a1a1a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold">ChatApp</span>
        </div>

        <nav className="flex items-center gap-8">
          <a href="#home" className="text-white no-underline hover:text-emerald-400 transition-colors duration-300">
            Home
          </a>
          <a href="#about" className="text-white no-underline hover:text-emerald-400 transition-colors duration-300">
            About
          </a>
          <a href="#safety" className="text-white no-underline hover:text-emerald-400 transition-colors duration-300">
            Safety
          </a>
        </nav>

        <button
          id="logout-btn"
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 bg-emerald-500 border-none rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-emerald-600"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-white">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-8">
        <button
          id="start-chat-btn"
          onClick={() => navigate("/chat")}
          className="max-w-xs w-full bg-emerald-500 text-black font-bold py-4 px-8 rounded-xl border-none flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 text-base hover:bg-emerald-600 hover:scale-105"
        >
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          START CHAT
        </button>
      </main>
    </div>
  );
}
