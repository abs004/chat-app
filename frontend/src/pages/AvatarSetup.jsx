import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvatarUrl } from "../utils/avatarUtils.js";
import { Shuffle } from "lucide-react";
import { API_BASE_URL } from "../constants/config.js";

const generateRandomSeed = () => {
  return Math.random().toString(36).substring(2, 10);
};

export default function AvatarSetup() {
  const { avatarSeed, updateAvatarSeed, authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  // Initialize preview with the current seed or a random one if default
  const [previewSeed, setPreviewSeed] = useState(() => 
    avatarSeed !== "default" ? avatarSeed : generateRandomSeed()
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShuffle = () => {
    setPreviewSeed(generateRandomSeed());
  };

  const handleSaveAndContinue = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarSeed: previewSeed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update avatar");
      }

      updateAvatarSeed(data.avatarSeed);
      navigate("/chat-landing");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4" style={{ fontFamily: "'Sora', sans-serif" }}>
      <div className="w-full max-w-[440px] bg-[#111418] border border-white/[0.08] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Choose your avatar
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-8 px-4 leading-relaxed">
          Pick one that represents you. You can always change it later in Settings.
        </p>

        {error && (
          <div className="w-full mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="relative mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-white/[0.04] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex items-center justify-center">
            <img 
              src={getAvatarUrl(previewSeed)} 
              alt="Avatar Preview" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <button
            onClick={handleShuffle}
            disabled={loading}
            className="absolute bottom-0 right-0 p-3 bg-[#111418] border border-white/[0.08] text-white rounded-full hover:bg-white/[0.05] transition-colors shadow-lg group focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            aria-label="Shuffle avatar"
          >
            <Shuffle size={20} className="text-[#9CA3AF] group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>

        <button
          onClick={handleSaveAndContinue}
          disabled={loading}
          className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-emerald-500 rounded-xl transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] mb-4 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? "Saving..." : "Save & Continue"}
        </button>

        <button
          onClick={() => navigate("/chat-landing")}
          disabled={loading}
          className="text-[#6B7280] text-sm font-medium hover:text-white transition-colors focus:outline-none"
        >
          Skip for now
        </button>

      </div>
    </div>
  );
}
