import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import { getToken } from "../utils/token.js"

const AVATAR_SEEDS = [
  "felix", "luna", "zara", "kai", "nova", "echo",
  "rio", "sage", "pixel", "blaze", "aurora", "storm"
];

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-xl flex items-center gap-2 z-50 ${type === "error" ? "bg-red-500" : "bg-emerald-500"
      }`}>
      {type === "success" && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {message}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { avatarSeed, updateAvatarSeed, authenticatedFetch } = useAuth();

  const [loadingSeed, setLoadingSeed] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSelectAvatar = async (seed) => {
    if (seed === avatarSeed || loadingSeed) return;

    setLoadingSeed(seed);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ avatarSeed: seed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update avatar");

      updateAvatarSeed(seed);
      showToast("Avatar updated!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingSeed(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-white flex flex-col" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center px-6 py-5 border-b border-white/[0.06] bg-[#0D0F12] sticky top-0 z-10 shrink-0">
        <button
          onClick={() => navigate("/chat-landing")}
          className="mr-4 p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-[#6B7280] hover:text-white transition-colors cursor-pointer bg-transparent border-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">Settings</h1>
          <p className="text-[#4B5563] text-xs">Customize your profile</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-semibold text-white mb-4">Choose your avatar</h2>

          <div className="bg-[#111418] border border-white/[0.07] rounded-2xl p-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {AVATAR_SEEDS.map((seed) => {
                const isSelected = seed === avatarSeed;
                const isLoading = seed === loadingSeed;

                return (
                  <button
                    key={seed}
                    onClick={() => handleSelectAvatar(seed)}
                    disabled={!!loadingSeed}
                    className="relative group flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all duration-200 ${isSelected
                        ? "border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "border-white/[0.1] hover:border-white/[0.3] group-hover:scale-105"
                      }`}>
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                        alt={`Avatar ${seed}`}
                        className="w-full h-full object-cover bg-white/[0.02]"
                      />

                      {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <svg className="animate-spin w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}

                      {isSelected && !isLoading && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-[0.65rem] font-medium uppercase tracking-wider transition-colors ${isSelected ? "text-emerald-400" : "text-[#6B7280] group-hover:text-white"
                      }`}>
                      {seed}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Toast message={toast.message} type={toast.type} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}
