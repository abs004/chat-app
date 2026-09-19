import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAvatarUrl } from "../../utils/avatarUtils.js";
import { CornerDownLeft, Trash2 } from "lucide-react";

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX_TRANSLATE = 40;

/**
 * A single chat message bubble with reply support.
 * - Desktop: shows a reply button on hover
 * - Mobile: swipe right to trigger reply
 */
const MessageBubble = ({ message, isOwn, partnerAvatarSeed, onReply, unsendMessage }) => {
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

  // ── Long press state (Mobile Action Sheet) ──────────────────────────────────
  const [showActionSheet, setShowActionSheet] = useState(false);
  const pressTimer = useRef(null);

  const handleTouchStart = (e) => {
    onTouchStart(e);
    if (isOwn) {
      pressTimer.current = setTimeout(() => {
        setShowActionSheet(true);
      }, 500);
    }
  };

  const handleTouchMove = (e) => {
    onTouchMove(e);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleTouchEnd = (e) => {
    onTouchEnd(e);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleContextMenu = (e) => {
    if (isOwn) {
      e.preventDefault();
      setShowActionSheet(true);
    }
  };

  // ── Reply quote preview ──────────────────────────────────────────────────────
  const ReplyQuote = () => {
    if (!message.replyTo?.content) return null;
    const label = (message.replyTo.senderIsYou === isOwn) ? "You" : "Partner";
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
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

          {/* Desktop hover actions (left side for own messages) */}
          <div className="absolute -left-16 bottom-2 hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => unsendMessage?.(message._id)}
              className="bg-[#1a1f26] border border-white/[0.08] rounded-lg p-1.5 cursor-pointer flex items-center justify-center hover:bg-white/[0.05]"
              aria-label="Delete"
            >
              <Trash2 size={14} className="text-[#9CA3AF] hover:text-red-400 transition-colors" />
            </button>
            <button
              onClick={() => onReply?.(message)}
              className="bg-[#1a1f26] border border-white/[0.08] rounded-lg p-1.5 cursor-pointer flex items-center justify-center hover:bg-white/[0.05]"
              aria-label="Reply"
            >
              <CornerDownLeft size={14} className="text-[#9CA3AF]" />
            </button>
          </div>

          <div className="flex flex-col">
            <ReplyQuote />
            <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-emerald-500 text-white text-sm leading-relaxed break-words shadow-[0_2px_8px_rgba(16,185,129,0.25)]">
              {message.content}
            </div>
          </div>
          <span className="text-[0.65rem] text-[#4B5563] px-1">{formatTime(message.createdAt)}</span>
        </div>

        {/* Mobile Action Sheet for OWN messages */}
        {showActionSheet && isOwn && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowActionSheet(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111418] border-t border-white/[0.08] rounded-t-2xl p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-bottom-full duration-200">
              <button 
                onClick={() => { setShowActionSheet(false); onReply?.(message); }}
                className="w-full bg-white/[0.05] hover:bg-white/[0.08] text-white py-3.5 rounded-xl text-sm font-semibold transition-colors border-none cursor-pointer"
              >
                Reply
              </button>
              <button 
                onClick={() => { setShowActionSheet(false); unsendMessage?.(message._id); }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3.5 rounded-xl text-sm font-semibold transition-colors border-none cursor-pointer"
              >
                Delete
              </button>
              <button 
                onClick={() => setShowActionSheet(false)}
                className="w-full bg-transparent text-[#6B7280] hover:text-white mt-2 py-2 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </>
        )}
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