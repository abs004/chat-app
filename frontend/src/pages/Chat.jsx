import { useState } from "react";
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
              <option value="" disabled>Select a reason...</option>
              <option value="harassment">Harassment</option>
              <option value="impersonation">Impersonation</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="other">Other</option>
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
    isMatching, isActive, isTyping,
    userId, partnerUserId, conversationId, sendMessage, handleEnd, handleNext, handleKeyDown,
    isBlocking, confirmBlocker, cancelBlocker,
  } = useChat();

  const { authenticatedFetch } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  if (isMatching) return <MatchingScreen onCancel={handleEnd} />;

  return (
    <div className="flex h-screen bg-[#0D0F12] text-white overflow-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
      <ChatSidebar
        userId={userId}
        canReport={conversationId !== null}
        onReportClick={() => {
          setReportError("");
          setReportSuccess("");
          setIsReportModalOpen(true);
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Status banner */}
        <div className={`flex items-center justify-center gap-2 px-6 py-2.5 border-b text-xs font-semibold tracking-widest uppercase transition-colors duration-300
          ${isActive
            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
            : "bg-red-500/5 border-red-500/10 text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
          {isActive ? "Connected to a stranger" : "Partner disconnected"}
        </div>

        <MessageList messages={messages} userId={userId} isActive={isActive} isTyping={isTyping} />

        {/* Typing Indicator */}
        <div className="px-6 pb-2 min-h-[32px] flex items-center">
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
          onEnd={handleEnd}
          onNext={handleNext}
          isActive={isActive}
        />
      </main>

      {/* Blocker confirmation modal */}
      {isBlocking && (
        <LeaveConfirmModal onConfirm={confirmBlocker} onCancel={cancelBlocker} />
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