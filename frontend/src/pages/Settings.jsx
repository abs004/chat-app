import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import { getToken } from "../utils/token.js"

import { Shuffle } from "lucide-react";
import { getAvatarUrl } from "../utils/avatarUtils.js";

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

  const [previewSeed, setPreviewSeed] = useState(avatarSeed || "default");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isSpinning, setIsSpinning] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleShuffle = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setPreviewSeed(randomSeed);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
  };

  const handleSaveAvatar = async () => {
    if (previewSeed === avatarSeed || isSaving) return;

    setIsSaving(true);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ avatarSeed: previewSeed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update avatar");

      updateAvatarSeed(previewSeed);
      showToast("Avatar updated!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSaving(false);
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
          <h1 className="text-white font-bold text-lg tracking-tight">Change Avatar</h1>
          <p className="text-[#4B5563] text-xs">Customize your profile</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center gap-8">
        <section className="flex flex-col items-center">

          <div className="relative w-[160px] h-[160px] mb-4">
            <img
              src={getAvatarUrl(previewSeed)}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-sm font-medium mb-10 text-[#9CA3AF]">
            {previewSeed === avatarSeed ? "Your current avatar" : "Preview"}
          </p>

          <div className="w-full max-w-xs flex flex-col gap-3">
            <button
              onClick={handleShuffle}
              className="flex items-center justify-center gap-2 bg-[#111418] border border-white/10 hover:bg-white/[0.05] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <Shuffle size={18} className={isSpinning ? "animate-spin" : ""} />
              Shuffle
            </button>

            <button
              onClick={handleSaveAvatar}
              disabled={previewSeed === avatarSeed || isSaving}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer border-none shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : toast.message === "Avatar updated!" ? (
                "Saved!"
              ) : (
                "Save Avatar"
              )}
            </button>
          </div>

          <p className="text-xs text-[#6B7280] mt-6 text-center">
            Keep shuffling until you find one you like
          </p>
        </section>
      </main>

      <Toast message={toast.message} type={toast.type} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}
