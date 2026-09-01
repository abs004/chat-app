import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import useChat from "../hooks/useChat.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import { getToken } from "../utils/token.js";

/**
 * Report modal for submitting user reports.
 */
function ReportModal({ onCancel, onSubmit, isLoading, error, success }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
        <div className="bg-[#111418] border border-emerald-500/30 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center justify-center gap-3 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-400 font-semibold">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
      <div className="bg-[#111418] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ fontFamily: "'Sora', sans-serif" }}>
        <h2 className="text-white font-semibold text-lg mb-1">Report this user</h2>
        <p className="text-[#6B7280] text-xs leading-relaxed mb-5">
          This will be reviewed by our team. False reports may result in action against your account.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#9CA3AF]">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
            >
              <option value="" disabled className="bg-[#111418] text-white">Select a reason...</option>
              <option value="harassment" className="bg-[#111418] text-white">Harassment</option>
              <option value="impersonation" className="bg-[#111418] text-white">Impersonation</option>
              <option value="spam" className="bg-[#111418] text-white">Spam</option>
              <option value="inappropriate" className="bg-[#111418] text-white">Inappropriate content</option>
              <option value="other" className="bg-[#111418] text-white">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <label className="text-xs font-semibold text-[#9CA3AF]">Description (Optional)</label>
              <span className="text-[0.65rem] text-[#6B7280]">{description.length}/500</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Provide any additional details..."
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-[#D1D5DB] rounded-xl text-sm font-semibold hover:bg-white/[0.09] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ reason, description })}
            disabled={!reason || isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation modal shown when useBlocker intercepts an in-app navigation.
 * Styled to match the app's dark design system.
 */
function LeaveConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease" }}
    >
      <div
        className="bg-[#111418] border border-white/[0.08] rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5 shadow-2xl"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg mb-1.5">Leave this chat?</h2>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Your partner will be notified and the conversation will end.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="leave-modal-stay"
            onClick={onCancel}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] text-[#D1D5DB] rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-white/[0.09] hover:border-white/[0.14]"
          >
            Stay
          </button>
          <button
            id="leave-modal-confirm"
            onClick={onConfirm}
            className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50"
          >
            Leave
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function Chat() {
  const {
    messages, input, setInput, handleInputChange,
    isMatching, isActive, localEnded, isTyping,
    userId, partnerUserId, partnerAvatarSeed, conversationId, sendMessage, handleEnd, handleNext, handleCancelMatch, handleKeyDown,
    insertEmoji, isBlocking, confirmBlocker, cancelBlocker,
  } = useChat();

  const navigate = useNavigate();
  const { authenticatedFetch } = useAuth();

useEffect(() => {
  if (!isMatching && !conversationId && !localEnded) {
    const timer = setTimeout(() => {
      navigate("/chat-landing");
    }, 500);
    return () => clearTimeout(timer);
  }
}, [isMatching, conversationId, localEnded, navigate]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const handleReportSubmit = async ({ reason, description }) => {
    setReportLoading(true);
    setReportError("");
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          reportedUserId: partnerUserId,
          conversationId,
          reason,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit report");

      setReportSuccess("Report submitted. We'll review it shortly.");
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess("");
      }, 2000);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  if (isMatching) return <MatchingScreen onCancel={handleCancelMatch} />;
  if (!isMatching && !conversationId && !localEnded) return null;
  return (
    <div className="flex bg-[#0D0F12] text-white overflow-hidden" style={{ height: '100dvh', fontFamily: "'Sora', sans-serif" }}>
      <ChatSidebar
        userId={userId}
        canReport={conversationId !== null}
        onReportClick={() => {
          setReportError("");
          setReportSuccess("");
          setIsReportModalOpen(true);
        }}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Desktop Back Button (absolute) */}
        <button
          onClick={() => navigate("/chat-landing")}
          className="hidden md:flex absolute top-3 left-4 items-center gap-1 bg-transparent text-[#6B7280] hover:text-white border-none transition-colors duration-200 z-10 text-sm font-medium"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between bg-[#111418] border-b border-white/[0.06] px-4 py-3">
          <button
            onClick={() => navigate("/chat-landing")}
            className="flex items-center gap-1 bg-transparent text-[#6B7280] hover:text-white border-none transition-colors duration-200 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back
          </button>
         <div className="flex md:hidden items-center gap-0">
            <img src="/logo.png" alt="G-Chat" className="h-14 w-auto -mr-3" />
            <span className="text-white font-semibold text-lg tracking-tight leading-tight" style={{fontFamily: "'Sora', sans-serif"}}>G-Chat</span>
          </div>
          <button
            onClick={() => {
              setReportError("");
              setReportSuccess("");
              setIsReportModalOpen(true);
            }}
            disabled={conversationId === null}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
              conversationId !== null ? "text-red-400 hover:bg-white/[0.05]" : "text-[#4B5563] cursor-not-allowed"
            }`}
          >
            <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className={`flex items-center justify-center gap-2 px-6 py-2.5 border-b text-xs font-semibold tracking-widest uppercase transition-colors duration-300 min-h-[36px]
          ${!localEnded && isActive
            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
            : "bg-red-500/5 border-red-500/10 text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${!localEnded && isActive ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
          {localEnded ? "You ended the chat" : (isActive ? "Connected to a stranger" : "Partner disconnected")}
        </div>

        <MessageList messages={messages} userId={userId} isActive={isActive} isTyping={isTyping} partnerAvatarSeed={partnerAvatarSeed} />

        {/* Typing Indicator */}
        <div className="px-3 sm:px-6 pb-2 min-h-[32px] flex items-center">
          {isTyping && isActive && (
            <div className="flex items-center gap-2 text-emerald-500/80 text-sm font-medium transition-all duration-300">
              <span>Partner is typing</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
        </div>

        <ChatInputBar
          input={input}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          onEnd={() => setIsEndModalOpen(true)}
          onNext={handleNext}
          isActive={isActive}
          localEnded={localEnded}
          insertEmoji={insertEmoji}
        />
      </main>

      {/* Blocker confirmation modal (for navigation via Back button) */}
      {isBlocking && (
        <LeaveConfirmModal onConfirm={confirmBlocker} onCancel={cancelBlocker} />
      )}

      {/* End button confirmation modal */}
      {isEndModalOpen && (
        <LeaveConfirmModal 
          onConfirm={() => {
            setIsEndModalOpen(false);
            handleEnd();
          }} 
          onCancel={() => setIsEndModalOpen(false)} 
        />
      )}

      {/* Report modal */}
      {isReportModalOpen && (
        <ReportModal
          onCancel={() => setIsReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          isLoading={reportLoading}
          error={reportError}
          success={reportSuccess}
        />
      )}

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}