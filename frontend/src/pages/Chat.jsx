import { useState } from "react";
import useChat from "../hooks/useChat.js";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";

function ReportModal({ onConfirm, onCancel, isSubmitting }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onConfirm({ reason, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease" }}>
      <div className="bg-[#111418] border border-white/[0.08] rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5 shadow-2xl" style={{ fontFamily: "'Sora', sans-serif" }}>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg mb-1.5">Report this user</h2>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Please select a reason for reporting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#E5E7EB] text-sm outline-none focus:border-emerald-500/50"
            required
          >
            <option value="" disabled>Select a reason...</option>
            <option value="harassment">Harassment</option>
            <option value="impersonation">Impersonation</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="other">Other</option>
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details (optional, max 500 chars)"
            maxLength={500}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#E5E7EB] text-sm outline-none focus:border-emerald-500/50 resize-none"
          />

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-white/[0.05] border border-white/[0.08] text-[#D1D5DB] rounded-xl py-2.5 text-sm font-semibold transition-all hover:bg-white/[0.09]">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !reason} className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl py-2.5 text-sm font-semibold transition-all hover:bg-red-500/20 disabled:opacity-50">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState("");
  const { authenticatedFetch } = useAuth();

  const {
    messages, input, setInput, handleInputChange,
    isMatching, isActive, isTyping,
    userId, partnerUserId, conversationId,
    sendMessage, handleEnd, handleNext, handleKeyDown,
    isBlocking, confirmBlocker, cancelBlocker,
  } = useChat();

  const handleReportSubmit = async ({ reason, description }) => {
    if (!partnerUserId || !conversationId) return;
    
    setIsSubmittingReport(true);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reported: partnerUserId,
          conversationId,
          reason,
          description
        })
      });

      if (res.ok) {
        setReportSuccessMessage("Report submitted. We'll review it shortly.");
        
        setTimeout(() => {
          setIsReportModalOpen(false);
          setReportSuccessMessage("");
          handleEnd(); // End chat automatically
        }, 2000);
      } else {
        console.error("Report failed");
        setIsReportModalOpen(false);
      }
    } catch (e) {
      console.error("Error submitting report", e);
      setIsReportModalOpen(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isMatching) return <MatchingScreen onCancel={handleEnd} />;

  return (
    <div className="flex h-screen bg-[#0D0F12] text-white overflow-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
      <ChatSidebar userId={userId} />

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
          onReport={() => setIsReportModalOpen(true)}
          isActive={isActive}
        />
      </main>

      {/* Blocker confirmation modal */}
      {isBlocking && (
        <LeaveConfirmModal onConfirm={confirmBlocker} onCancel={cancelBlocker} />
      )}

      {/* Report Modal */}
      {isReportModalOpen && !reportSuccessMessage && (
        <ReportModal 
          onConfirm={handleReportSubmit} 
          onCancel={() => setIsReportModalOpen(false)}
          isSubmitting={isSubmittingReport} 
        />
      )}
      
      {/* Report Success Message */}
      {reportSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease" }}>
          <div className="bg-[#111418] border border-emerald-500/30 rounded-2xl p-6 text-emerald-400 font-semibold shadow-2xl flex items-center gap-3">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {reportSuccessMessage}
          </div>
        </div>
      )}

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}