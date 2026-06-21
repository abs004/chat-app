import useChat from "../hooks/useChat.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";

/**
 * Chat page — pure orchestration component.
 * All state, socket wiring, and API calls live in useChat.
 * All UI sub-sections are dedicated, single-responsibility components.
 */
export default function Chat() {
  const {
    messages,
    input,
    setInput,
    isMatching,
    isActive,
    isTyping,
    userId,
    sendMessage,
    handleEnd,
    handleNext,
    handleKeyDown,
  } = useChat();

  if (isMatching) {
    return <MatchingScreen onCancel={handleEnd} />;
  }

  return (
    <div className="flex h-screen bg-[#0d1a12] text-[#e2f0e2] overflow-hidden font-sans">
      <ChatSidebar userId={userId} />

      <main className="flex-1 flex flex-col bg-[#0d1a12] overflow-hidden">
        {/* Stranger banner */}
        <div className="text-center px-6 py-2.5 bg-[#111f17] border-b border-[#1e3a26] text-[0.72rem] font-semibold tracking-widest text-[#6b9e7d]">
          {isActive
            ? "YOU ARE NOW CHATTING WITH A RANDOM STRANGER"
            : "PARTNER HAS DISCONNECTED"}
        </div>

        <MessageList
          messages={messages}
          userId={userId}
          isActive={isActive}
          isTyping={isTyping}
        />

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
    </div>
  );
}
