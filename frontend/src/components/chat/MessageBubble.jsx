import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAvatarUrl } from "../../utils/avatarUtils.js";
import { CornerDownLeft } from "lucide-react";

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX_TRANSLATE = 40;

/**
 * A single chat message bubble with reply support.
 * - Desktop: shows a reply button on hover
 * - Mobile: swipe right to trigger reply
 */
const MessageBubble = ({ message, isOwn, partnerAvatarSeed, onReply }) => {
  const { avatarSeed } = useAuth();
  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Swipe state ─────────────────────────────────────────────────────────────
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const swipeTriggered = useRef(false);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeTriggered.current = false;
    setIsSwiping(false);
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only track horizontal swipes (ignore scroll)
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx > 0) {
      setIsSwiping(true);
      const clamped = Math.min(dx, SWIPE_MAX_TRANSLATE);
      setSwipeX(clamped);

      if (dx >= SWIPE_THRESHOLD && !swipeTriggered.current) {
        swipeTriggered.current = true;
        onReply?.(message);
      }
    }
  };

  const onTouchEnd = () => {
    setSwipeX(0);
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ── Reply quote preview ──────────────────────────────────────────────────────
  const ReplyQuote = () => {
    if (!message.replyTo?.content) return null;
    const { userId } = useAuth(); // already imported
    const label = message.replyTo.senderIsYou === isOwn ? "You" : "Partner";
    const preview = message.replyTo.content?.length > 60
      ? message.replyTo.content.slice(0, 60) + "…"
      : message.replyTo.content;
    return (
      <div className="flex items-stretch gap-0 mb-1">
        <div className="w-0.5 rounded-full bg-emerald-500 shrink-0" />
        <div className="bg-white/[0.05] rounded-lg px-3 py-1.5 ml-1.5 text-xs text-[#9CA3AF] leading-relaxed">
          <span className="text-emerald-400 font-semibold text-[0.65rem] block">{label}</span>
          {preview}
        </div>
      </div>
    );
  };

  if (isOwn) {
    return (
      <div className="flex items-end gap-2 flex-row-reverse group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          className="w-9 h-9 object-cover shrink-0"
          src={getAvatarUrl(avatarSeed || message.sender)}
          alt="me"
        />
        <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-[58%] items-end relative"
          style={{ transform: `translateX(${swipeX}px)`, transition: isSwiping ? "none" : "transform 0.2s ease" }}
        >
          {/* Reply icon that appears during swipe (left side for own messages) */}
          {swipeX > 8 && (
            <div className="absolute -left-7 bottom-3 text-emerald-400 opacity-70">
              <CornerDownLeft size={16} />
            </div>
          )}

          {/* Desktop hover reply button (left side for own messages) */}
          <button
            onClick={() => onReply?.(message)}
            className="absolute -left-8 bottom-2 bg-[#1a1f26] border border-white/[0.08] rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:flex items-center justify-center"
            aria-label="Reply"
          >
            <CornerDownLeft size={14} className="text-[#9CA3AF]" />
          </button>

          <div className="flex flex-col">
            <ReplyQuote />
            <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-emerald-500 text-white text-sm leading-relaxed break-words shadow-[0_2px_8px_rgba(16,185,129,0.25)]">
              {message.content}
            </div>
          </div>
          <span className="text-[0.65rem] text-[#4B5563] px-1">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        className="w-9 h-9 object-cover shrink-0"
        src={getAvatarUrl(partnerAvatarSeed || "partner")}
        alt="stranger"
      />
      <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-[58%] relative"
        style={{ transform: `translateX(${swipeX}px)`, transition: isSwiping ? "none" : "transform 0.2s ease" }}
      >
        {/* Reply icon that appears during swipe (left side for received messages) */}
        {swipeX > 8 && (
          <div className="absolute -left-7 bottom-3 text-emerald-400 opacity-70">
            <CornerDownLeft size={16} />
          </div>
        )}

        {/* Desktop hover reply button (right side for received messages) */}
        <button
          onClick={() => onReply?.(message)}
          className="absolute -right-8 bottom-2 bg-[#1a1f26] border border-white/[0.08] rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:flex items-center justify-center"
          aria-label="Reply"
        >
          <CornerDownLeft size={14} className="text-[#9CA3AF]" />
        </button>

        <div className="flex flex-col">
          <ReplyQuote />
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/[0.07] text-[#E5E7EB] text-sm leading-relaxed break-words">
            {message.content}
          </div>
        </div>
        <span className="text-[0.65rem] text-[#4B5563] px-1">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;