import { useState, useEffect, useRef, useCallback } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

/**
 * The bottom input bar with End, message input, Send, Skip, and Emoji controls.
 */
const ChatInputBar = ({ input, onInputChange, onKeyDown, onSend, onEnd, onNext, isActive, insertEmoji }) => {
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
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

  // Auto-reset skip confirm after 3 s
  useEffect(() => {
    let timeout;
    if (isConfirmingSkip) {
      timeout = setTimeout(() => setIsConfirmingSkip(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirmingSkip]);

  const handleSkipClick = () => {
    if (isConfirmingSkip) {
      onNext();
      setIsConfirmingSkip(false);
    } else {
      setIsConfirmingSkip(true);
    }
  };

  const handleEmojiSelect = useCallback((emoji) => {
    insertEmoji?.(emoji);
    setShowPicker(false);
  }, [insertEmoji]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div
      className="relative bg-[#111418] border-t border-white/[0.06] px-3 sm:px-5 pt-3.5 pb-3 flex flex-col gap-2.5"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {/* Desktop picker — floats above the emoji button */}
      {showPicker && !isMobile && (
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

      {/* Mobile bottom-sheet picker */}
      {showPicker && isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowPicker(false)}
          />
          <div
            ref={pickerRef}
            className="fixed bottom-0 left-0 right-0 z-50"
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
        </>
      )}

      {/* Button row */}
      <div className="flex items-center gap-2">
        {/* End */}
        <button
          onClick={onEnd}
          className="flex items-center gap-1.5 bg-transparent border border-red-500/40 text-red-400 rounded-xl px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-red-500/10 hover:border-red-500/70"
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">End</span>
        </button>

        {/* Emoji button */}
        <button
          ref={emojiButtonRef}
          onClick={() => setShowPicker((p) => !p)}
          disabled={!isActive}
          aria-label="Emoji"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
        >
          😊
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder={isActive ? "Type a message…" : "Conversation ended"}
          disabled={!isActive}
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#E5E7EB] text-sm outline-none transition-all duration-200 placeholder-[#4B5563] focus:border-emerald-500/50 focus:bg-white/[0.06] disabled:opacity-40"
        />

        {/* Send */}
        <button
          onClick={onSend}
          disabled={!isActive}
          aria-label="Send"
          className="w-10 h-10 bg-emerald-500 border-none rounded-xl text-white flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>

        {/* Skip */}
        <button
          onClick={handleSkipClick}
          className={`flex items-center gap-1.5 border rounded-xl px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold cursor-pointer shrink-0 transition-all duration-200 ${
            isConfirmingSkip
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50"
              : "bg-white/[0.04] border-white/[0.08] text-[#9CA3AF] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
          }`}
        >
          {isConfirmingSkip ? (
            <>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:hidden">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Are you sure?</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Skip</span>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;