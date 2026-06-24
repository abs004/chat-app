import useChat from "../hooks/useChat.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";

export default function Chat() {
  const {
    messages, input, setInput,
    isMatching, isActive, isTyping,
    userId, sendMessage, handleEnd, handleNext, handleKeyDown,
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

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}