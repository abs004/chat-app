import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import { getAvatarUrl } from "../../utils/avatarUtils.js";

/**
 * Scrollable message list with typing indicator.
 */
const MessageList = ({ messages, userId, isActive, isTyping, partnerAvatarSeed }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 flex flex-col gap-3"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>

      {!isActive && messages.length > 0 && (
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[0.7rem] text-[#4B5563] font-medium">Conversation ended</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={msg.sender === userId}
          partnerAvatarSeed={msg.sender !== userId ? partnerAvatarSeed : undefined}
        />
      ))}

      {/* Typing indicator */}
      {isTyping && isActive && (
        <div className="flex items-end gap-2">
          <img
            className="w-9 h-9 object-cover shrink-0"
            src={getAvatarUrl(partnerAvatarSeed || "partner")}
            alt="stranger typing"
          />
          <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.07] px-3.5 py-3 rounded-2xl rounded-bl-sm">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
                style={{ animation: "typingDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};

export default MessageList;