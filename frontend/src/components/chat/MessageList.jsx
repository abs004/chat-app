import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

/**
 * Renders the scrollable message list and the typing indicator.
 * Auto-scrolls to the bottom whenever messages change.
 */
const MessageList = ({ messages, userId, isActive, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-messages">
      {!isActive && messages.length > 0 && (
        <div
          style={{
            textAlign: "center",
            margin: "1rem",
            color: "#6b9e7d",
            fontSize: "0.8rem",
          }}
        >
          Conversation ended.
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={msg.sender === userId}
        />
      ))}

      {/* Typing indicator — shown when partner is typing and chat is active */}
      {isTyping && isActive && (
        <div className="msg-row msg-row--left">
          <img
            className="msg-avatar"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=partner"
            alt="stranger typing"
          />
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
