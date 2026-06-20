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
  <div className="chat-input-bar">
    <div className="chat-input-row">
      {/* End current conversation */}
      <button className="end-btn" onClick={onEnd} id="end-chat-btn">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        End
      </button>

      <input
        id="message-input"
        className="chat-input"
        type="text"
        placeholder={isActive ? "Type a message..." : "Conversation ended"}
        disabled={!isActive}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />

      {/* Send message */}
      <button
        id="send-message-btn"
        className="send-btn"
        onClick={onSend}
        disabled={!isActive}
        aria-label="Send"
        style={{ opacity: isActive ? 1 : 0.5 }}
      >
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>

      {/* Skip to next stranger */}
      <button id="next-chat-btn" className="next-btn" onClick={onNext}>
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
        </svg>
        Next
      </button>
    </div>

    {/* Toolbar row — placeholder buttons for future features */}
    <div className="chat-toolbar">
      <button className="toolbar-btn" title="Emoji (coming soon)">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Emoji
      </button>
      <button className="toolbar-btn" title="Image (coming soon)">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Image
      </button>
      <span className="searching-label">
        Searching for:{" "}
        <span className="searching-tags">Music, Gaming, Tech</span>
      </span>
    </div>
  </div>
);

export default ChatInputBar;
