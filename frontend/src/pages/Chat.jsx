import useChat from "../hooks/useChat.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";

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
    messages, input, setInput,
    isMatching, isActive, isTyping,
    userId, sendMessage, handleEnd, handleNext, handleKeyDown,
    isBlocking, confirmBlocker, cancelBlocker,
  } = useChat();

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
        <ChatInputBar
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
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

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}