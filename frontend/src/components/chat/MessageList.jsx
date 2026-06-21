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
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-[1.15rem] custom-scrollbar">
      {!isActive && messages.length > 0 && (
        <div className="text-center my-4 text-[#6b9e7d] text-[0.8rem]">
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
        <div className="flex items-end gap-2.5">
          <img
            className="w-[2.2rem] h-[2.2rem] rounded-full object-cover shrink-0 border border-[#1e3a26]"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=partner"
            alt="stranger typing"
          />
          <div className="flex items-center gap-1 bg-[#1a2e20] px-3.5 py-2.5 rounded-2xl rounded-bl-[0.2rem]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#6fcf97] animate-typing-1 inline-block" />
            <span className="w-[7px] h-[7px] rounded-full bg-[#6fcf97] animate-typing-2 inline-block" />
            <span className="w-[7px] h-[7px] rounded-full bg-[#6fcf97] animate-typing-3 inline-block" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
