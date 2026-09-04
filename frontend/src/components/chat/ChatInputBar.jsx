import { useState, useEffect, useRef, useCallback } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { CornerDownLeft, X } from "lucide-react";

/**
 * The bottom input bar with End, message input, Send, Skip, and Emoji controls.
 */
const ChatInputBar = ({ input, onInputChange, onKeyDown, onSend, onEnd, onNext, isActive, localEnded, insertEmoji, replyingTo, cancelReply }) => {
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        emojiButtonRef.current && !emojiButtonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  // Auto-close picker on outside click (kept existing logic)

  const handleEmojiSelect = useCallback((emoji) => {
  insertEmoji?.(emoji);
}, [insertEmoji]);

  return (
    <div
      className="shrink-0 relative bg-[#111418] border-t border-white/[0.06] px-3 sm:px-5 pt-3.5 pb-3 flex flex-col gap-2.5"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {/* Desktop picker — floats above the emoji button */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 mb-2 z-50"
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="dark"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
            navPosition="bottom"
          />
        </div>
      )}

      {/* Reply preview bar */}
      {replyingTo && isActive && !localEnded && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border-t border-emerald-500/20 -mx-3 sm:-mx-5 -mt-3.5 px-3 pt-2.5 pb-2 mb-1">
          <CornerDownLeft size={14} className="text-emerald-400 shrink-0" />
          <span className="text-emerald-400 text-xs font-medium shrink-0">Replying to:</span>
          <span className="text-[#9CA3AF] text-xs truncate flex-1">
            {replyingTo.content?.length > 50 ? replyingTo.content.slice(0, 50) + "…" : replyingTo.content}
          </span>
          <button
            onClick={cancelReply}
            className="text-[#6B7280] hover:text-white bg-transparent border-none cursor-pointer shrink-0 p-0.5"
            aria-label="Cancel reply"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Button row */}
      <div className="flex items-center gap-2">
        {/* End / Next Toggle */}
        {!localEnded && isActive ? (
          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 bg-transparent border border-red-500/40 text-red-400 rounded-xl px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-red-500/10 hover:border-red-500/70"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">End</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 bg-transparent border border-emerald-500/40 text-emerald-400 rounded-xl px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-emerald-500/10 hover:border-emerald-500/70"
          >
            <span className="hidden sm:inline">Next</span>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Emoji button */}
        <button
          ref={emojiButtonRef}
          onClick={() => setShowPicker((p) => !p)}
          disabled={!isActive || localEnded}
          aria-label="Emoji"
          className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed text-lg leading-none"
        >
          😊
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder={isActive && !localEnded ? "Type a message…" : "Chat ended"}
          disabled={!isActive || localEnded}
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#E5E7EB] text-sm outline-none transition-all duration-200 placeholder-[#4B5563] focus:border-emerald-500/50 focus:bg-white/[0.06] disabled:opacity-40"
        />

        {/* Send */}
        <button
          onClick={onSend}
          disabled={!isActive || localEnded}
          aria-label="Send"
          className="w-10 h-10 bg-emerald-500 border-none rounded-xl text-white flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>


      </div>
    </div>
  );
};

export default ChatInputBar;