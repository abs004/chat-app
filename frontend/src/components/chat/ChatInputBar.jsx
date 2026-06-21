/**
 * The bottom input bar with End, message input, Send, and Next controls.
 * Fully controlled — all state and handlers come from the parent via props.
 */
const ChatInputBar = ({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  onEnd,
  onNext,
  isActive,
}) => (
  <div className="bg-[#0f1f15] border-t border-[#1e3a26] px-5 pt-3.5 pb-2.5 flex flex-col gap-2">
    <div className="flex items-center gap-2.5">
      {/* End current conversation */}
      <button
        id="end-chat-btn"
        onClick={onEnd}
        className="flex items-center gap-1.5 bg-transparent border-2 border-red-500 text-red-500 rounded-[0.55rem] px-4 py-2 text-[0.88rem] font-bold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-red-500 hover:text-white"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        End
      </button>

      {/* Message text input */}
      <input
        id="message-input"
        type="text"
        placeholder={isActive ? "Type a message..." : "Conversation ended"}
        disabled={!isActive}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="flex-1 bg-[#1a2e20] border border-[#1e3a26] rounded-[0.55rem] px-4 py-2.5 text-[#d1fae5] font-sans text-[0.9rem] outline-none transition-colors duration-200 placeholder-[#4b7a5a] focus:border-[#22c55e] disabled:opacity-60"
      />

      {/* Send message */}
      <button
        id="send-message-btn"
        onClick={onSend}
        disabled={!isActive}
        aria-label="Send"
        style={{ opacity: isActive ? 1 : 0.5 }}
        className="w-[2.4rem] h-[2.4rem] bg-[#22c55e] border-none rounded-[0.55rem] text-[#052e10] flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 hover:bg-[#16a34a] hover:scale-105 disabled:cursor-not-allowed"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[1.1rem] h-[1.1rem]">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>

      {/* Skip to next stranger */}
      <button
        id="next-chat-btn"
        onClick={onNext}
        className="flex items-center gap-1.5 bg-[#22c55e] border-none rounded-[0.55rem] px-4 py-2 text-[#052e10] text-[0.88rem] font-bold cursor-pointer shrink-0 transition-all duration-200 hover:bg-[#16a34a] hover:scale-[1.03]"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
        </svg>
        Next
      </button>
    </div>

    {/* Toolbar row — placeholder buttons for future features */}
    <div className="flex items-center gap-2">
      <button
        title="Emoji (coming soon)"
        className="flex items-center gap-1.5 bg-none border-none text-[#6b9e7d] text-[0.8rem] cursor-pointer px-2 py-1.5 rounded-[0.35rem] transition-all duration-200 hover:text-[#22c55e] hover:bg-[#1a3323]"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-[0.95rem] h-[0.95rem]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Emoji
      </button>

      <button
        title="Image (coming soon)"
        className="flex items-center gap-1.5 bg-none border-none text-[#6b9e7d] text-[0.8rem] cursor-pointer px-2 py-1.5 rounded-[0.35rem] transition-all duration-200 hover:text-[#22c55e] hover:bg-[#1a3323]"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-[0.95rem] h-[0.95rem]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Image
      </button>

      <span className="ml-auto text-[0.75rem] text-[#4b7a5a]">
        Searching for:{" "}
        <span className="text-[#22c55e] font-semibold">Music, Gaming, Tech</span>
      </span>
    </div>
  </div>
);

export default ChatInputBar;
