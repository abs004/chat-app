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
    <div className="msg-row msg-row--right">
      <div className="msg-bubble-wrap msg-bubble-wrap--right">
        <div className="msg-bubble msg-bubble--me">{message.content}</div>
        <span className="msg-time msg-time--right">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <img
        className="msg-avatar"
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
        alt="me"
      />
    </div>
  ) : (
    <div className="msg-row msg-row--left">
      <img
        className="msg-avatar"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=partner"
        alt="stranger"
      />
      <div className="msg-bubble-wrap">
        <div className="msg-bubble msg-bubble--stranger">{message.content}</div>
        <span className="msg-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
