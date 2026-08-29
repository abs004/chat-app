import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import { getToken } from "../utils/token.js";

export default function TermsOfUse() {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { authenticatedFetch } = useAuth();

  const handleContinue = async () => {
    if (!agreed) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/accept-terms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept terms");

      // Navigate to avatar setup upon successful terms acceptance
      localStorage.setItem("termsAccepted", "true");
      navigate("/avatar-setup");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0D0F12] text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b border-white/[0.06] bg-[#111418]">
        <div className="flex items-center gap-2.5 max-w-3xl mx-auto">
          <img src="/favicon-96x96.png" alt="G-Chat" className="w-8 h-8" />
          <span className="text-white font-bold text-lg tracking-tight">G-Chat</span>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#0D0F12]">
        <div className="max-w-3xl mx-auto bg-[#111418] border border-white/[0.08] rounded-2xl p-6 lg:p-10 shadow-2xl">
          <h1 className="text-2xl font-bold mb-8 text-white">Terms of Use</h1>

          <div className="space-y-8 text-[#9CA3AF] text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-semibold text-base mb-2">1. Introduction</h2>
              <p>G-Chat is an anonymous 1v1 chat platform exclusively for students of Government Engineering College, Palakkad. By using this platform you agree to the following terms.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">2. Eligibility</h2>
              <p>This platform is restricted to students with a valid @gecskp.ac.in email address.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">3. Anonymous Use</h2>
              <p>All chats are anonymous. You will not know the identity of your chat partner. Do not trust anyone's claimed name, department, or identity. G-Chat does not verify user identities during chat.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">4. Privacy</h2>
              <p>Messages are temporarily stored during your chat session and deleted within 15 minutes after the chat ends. Messages from reported conversations may be retained for review. We do not sell or share your data with third parties.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">5. Prohibited Conduct</h2>
              <p>The following are strictly prohibited: harassment, hate speech, impersonation, sharing of personal information without consent, sexual content, threats or violence, spam or flooding.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">6. Reporting & Bans</h2>
              <p>Users who violate these terms may be temporarily or permanently banned. You can report a user during or immediately after a chat using the Report button. False reports may result in action against your account.</p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-2">7. Disclaimer</h2>
              <p>G-Chat is a student project and is not officially affiliated with Government Engineering College, Palakkad. Use at your own discretion.</p>
            </section>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="flex-none bg-[#111418] border-t border-white/[0.06] p-6">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${agreed ? "bg-emerald-500 border-emerald-500" : "bg-white/[0.04] border-white/[0.14] group-hover:border-white/[0.25]"}`}>
                {agreed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-[#D1D5DB] font-medium text-sm transition-colors group-hover:text-white">
                I have read and agree to the Terms of Use
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!agreed || isLoading}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${agreed && !isLoading
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                  : "bg-white/[0.05] text-[#6B7280] cursor-not-allowed border border-white/[0.05]"
                }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Continue
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
