import { useState, useEffect } from "react";

/**
 * The bottom input bar with End, message input, Send, and Skip controls.
 */
const ChatInputBar = ({ input, onInputChange, onKeyDown, onSend, onEnd, onNext, isActive }) => {
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);

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

  return (
    <div
      className="bg-[#111418] border-t border-white/[0.06] px-5 pt-3.5 pb-3 flex flex-col gap-2.5"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <div className="flex items-center gap-2">
        {/* End */}
        <button
          onClick={onEnd}
          className="flex items-center gap-1.5 bg-transparent border border-red-500/40 text-red-400 rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-red-500/10 hover:border-red-500/70"
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          End
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
          className={`flex items-center gap-1.5 border rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer shrink-0 transition-all duration-200 ${
            isConfirmingSkip
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50"
              : "bg-white/[0.04] border-white/[0.08] text-[#9CA3AF] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
          }`}
        >
          {isConfirmingSkip ? "Are you sure?" : "Skip"}
          {!isConfirmingSkip && (
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

    {/* Toolbar */}
    <div className="flex items-center gap-1">
      <button title="Emoji (coming soon)" className="flex items-center gap-1.5 bg-transparent border-none text-[#4B5563] text-xs cursor-pointer px-2 py-1.5 rounded-lg transition-all duration-200 hover:text-[#9CA3AF] hover:bg-white/[0.04]">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Emoji
      </button>

      <button title="Image (coming soon)" className="flex items-center gap-1.5 bg-transparent border-none text-[#4B5563] text-xs cursor-pointer px-2 py-1.5 rounded-lg transition-all duration-200 hover:text-[#9CA3AF] hover:bg-white/[0.04]">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Image
      </button>

      <span className="ml-auto text-[0.68rem] text-[#374151]">
        Interests:{" "}
        <span className="text-emerald-500 font-medium">Music · Gaming · Tech</span>
      </span>
    </div>
    </div>
  );
};

export default ChatInputBar;