import useChat from "../hooks/useChat.js";
import MatchingScreen from "../components/chat/MatchingScreen.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import ChatInputBar from "../components/chat/ChatInputBar.jsx";
import "./Chat.css";

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
    <div className="chat-page">
      <ChatSidebar userId={userId} />

      <main className="chat-main">
        <div className="chat-stranger-banner">
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
