import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { fetchMessages } from "../services/api/messageApi.js";

/**
 * useChat encapsulates the entire chat session state and socket event wiring.
 * The Chat page component becomes a pure renderer — no socket or API code inside it.
 */
const useChat = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const socketRef = useSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isMatching, setIsMatching] = useState(true);
  const [isActive, setIsActive] = useState(true);
  // isTyping is wired and ready — set to true when 'typing' socket event arrives
  const [isTyping, setIsTyping] = useState(false);

  // ── Load message history when a match is found ───────────────────────────
  const loadHistory = useCallback(async (convId) => {
    try {
      const { messages: history, isActive: active } =
        await fetchMessages(convId);
      setMessages(history || []);
      setIsActive(active);
    } catch (err) {
      console.error("[useChat] Failed to load history:", err.message);
    }
  }, []);

  // ── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onMatchFound = ({ conversationId: convId }) => {
      setConversationId(convId);
      setIsMatching(false);
      setIsActive(true);
      loadHistory(convId);
    };

    const onReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onPartnerDisconnected = () => {
      setIsActive(false);
      setIsTyping(false);
    };

    // Ready for typing indicators — wire up 'typing' event from partner
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);

    socket.on("match-found", onMatchFound);
    socket.on("receive-message", onReceiveMessage);
    socket.on("partner-disconnected", onPartnerDisconnected);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    socket.on("connect_error", (err) =>
      console.error("[Socket] connection error:", err.message)
    );

    // Request a match as soon as we're wired up
    socket.emit("match-me");

    return () => {
      socket.off("match-found", onMatchFound);
      socket.off("receive-message", onReceiveMessage);
      socket.off("partner-disconnected", onPartnerDisconnected);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
    };
  }, [socketRef, loadHistory]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!input.trim() || !conversationId || !isActive) return;
    socketRef.current?.emit("send-message", {
      conversationId,
      content: input.trim(),
    });
    setInput("");
  }, [input, conversationId, isActive, socketRef]);

  const handleEnd = useCallback(() => {
    socketRef.current?.emit("leave-chat", { conversationId });
    navigate("/chat-landing");
  }, [conversationId, socketRef, navigate]);

  const handleNext = useCallback(() => {
    socketRef.current?.emit("leave-chat", { conversationId });
    setConversationId(null);
    setIsMatching(true);
    setMessages([]);
    setIsActive(true);
    setIsTyping(false);
    socketRef.current?.emit("match-me");
  }, [conversationId, socketRef]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    messages,
    input,
    setInput,
    conversationId,
    isMatching,
    isActive,
    isTyping,
    userId,
    sendMessage,
    handleEnd,
    handleNext,
    handleKeyDown,
  };
};

export default useChat;
