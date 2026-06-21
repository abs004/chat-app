/**
 * A single chat message bubble.
 * Receives the message object and whether it belongs to the current user.
 */
const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return isOwn ? (
    /* Own message — right-aligned */
    <div className="flex items-end gap-2.5 flex-row-reverse">
      <div className="flex flex-col gap-1 max-w-[58%] items-end">
        <div className="px-4 py-2.5 rounded-2xl rounded-br-[0.2rem] bg-[#22c55e] text-[#052e10] font-medium text-[0.9rem] leading-relaxed break-words">
          {message.content}
        </div>
        <span className="text-[0.7rem] text-[#4b7a5a] px-1 text-right">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <img
        className="w-[2.2rem] h-[2.2rem] rounded-full object-cover shrink-0 border border-[#1e3a26]"
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
        alt="me"
      />
    </div>
  ) : (
    /* Stranger message — left-aligned */
    <div className="flex items-end gap-2.5">
      <img
        className="w-[2.2rem] h-[2.2rem] rounded-full object-cover shrink-0 border border-[#1e3a26]"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=partner"
        alt="stranger"
      />
      <div className="flex flex-col gap-1 max-w-[58%]">
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-[0.2rem] bg-[#1a2e20] text-[#d1fae5] text-[0.9rem] leading-relaxed break-words">
          {message.content}
        </div>
        <span className="text-[0.7rem] text-[#4b7a5a] px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
