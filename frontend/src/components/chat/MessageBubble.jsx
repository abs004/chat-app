import { useAuth } from "../../context/AuthContext.jsx";
import { getAvatarUrl } from "../../utils/avatarUtils.js";


/**
 * A single chat message bubble.
 */
const MessageBubble = ({ message, isOwn }) => {
  const { avatarSeed } = useAuth();
  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return isOwn ? (
    <div className="flex items-end gap-2 flex-row-reverse">
      <img
        className="w-9 h-9 object-cover shrink-0"
        src={getAvatarUrl(avatarSeed || message.sender)}
        alt="me"
      />
      <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-[58%] items-end">
        <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-emerald-500 text-white text-sm leading-relaxed break-words shadow-[0_2px_8px_rgba(16,185,129,0.25)]">
          {message.content}
        </div>
        <span className="text-[0.65rem] text-[#4B5563] px-1">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  ) : (
    <div className="flex items-end gap-2">
      <img
        className="w-9 h-9 object-cover shrink-0"
        src={getAvatarUrl("partner")}
        alt="stranger"
      />
      <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-[58%]">
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/[0.07] text-[#E5E7EB] text-sm leading-relaxed break-words">
          {message.content}
        </div>
        <span className="text-[0.65rem] text-[#4B5563] px-1">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;