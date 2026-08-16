import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useBlocker } from "react-router-dom";
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
  // Ref so event handlers / beforeunload / blocker always read the latest
  // conversationId without stale closures.
  const conversationIdRef = useRef(null);
  const [isMatching, setIsMatching] = useState(true);
  const [isActive, setIsActive] = useState(true);
  // isTyping is wired and ready — set to true when 'typing' socket event arrives
  const [isTyping, setIsTyping] = useState(false);

  // ── Helper: emit leave-chat once and clear the ref ───────────────────────
  // Centralising emission here guarantees the ref is always nulled afterward
  // so duplicate emissions are impossible regardless of which code path fires.
  const emitLeaveChat = useCallback((convId) => {
    if (!convId) return;
    socketRef.current?.emit("leave-chat", { conversationId: convId });
    conversationIdRef.current = null;
  }, [socketRef]);

  // ── Load message history when a match is found ───────────────────────────
  const loadHistory = useCallback(async (convId, liveMatch = false) => {
    try {
      const { messages: history, isActive: active } =
        await fetchMessages(convId);
      setMessages(history || []);
      // For a fresh live match, trust the socket state (isActive=true already set).
      // Only update isActive from the server when loading a pre-existing conversation
      // that might already be closed — prevents a stale false from blanking the screen.
      if (!liveMatch) {
        setIsActive(active);
      }
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
      conversationIdRef.current = convId;   // keep ref in sync
      setIsMatching(false);
      setIsActive(true);
      // Pass liveMatch=true so loadHistory won't overwrite isActive=true
      // with a stale server value while the conversation is actively in progress.
      loadHistory(convId, true);
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
      // Do NOT emit leave-chat here — it is emitted only from explicit actions:
      // handleEnd, handleNext, confirmed blocker navigation, and beforeunload.
      // Emitting here would double-fire on every React strict-mode remount and
      // on the "Next" flow where match-me must not see a stale active conversation.
      socket.off("match-found", onMatchFound);
      socket.off("receive-message", onReceiveMessage);
      socket.off("partner-disconnected", onPartnerDisconnected);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
    };
  }, [socketRef, loadHistory]);

  // ── beforeunload — tab close / browser refresh ───────────────────────────
  // Shows the native browser "Leave site?" dialog and emits leave-chat
  // synchronously (sendBeacon-style via socket) before the page unloads.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!conversationIdRef.current) return;
      // Trigger browser's native "Leave site?" confirmation
      e.preventDefault();
      e.returnValue = "";
      // Best-effort synchronous emit — the socket may not flush in time on
      // hard closes, but the backend disconnect handler is the final safety net.
      emitLeaveChat(conversationIdRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [emitLeaveChat]);

  // ── useBlocker — intercept in-app navigation ─────────────────────────────
  // Blocks React Router navigations (back button, link clicks, programmatic
  // navigate()) when the user is in a live active chat.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isActive &&
      conversationIdRef.current !== null &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Confirm: user chose "Leave" — emit leave-chat then let navigation proceed
  const confirmBlocker = useCallback(() => {
    emitLeaveChat(conversationIdRef.current);
    blocker.proceed?.();
  }, [blocker, emitLeaveChat]);

  // Cancel: user chose "Stay" — reset blocker without leaving
  const cancelBlocker = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

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
    emitLeaveChat(conversationIdRef.current);
    navigate("/chat-landing");
  }, [emitLeaveChat, navigate]);

  const handleNext = useCallback(() => {
    emitLeaveChat(conversationIdRef.current);
    setConversationId(null);
    setIsMatching(true);
    setMessages([]);
    setIsActive(true);
    setIsTyping(false);
    socketRef.current?.emit("match-me");
  }, [emitLeaveChat, socketRef]);

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
    // Blocker state for the confirmation modal in Chat.jsx
    isBlocking: blocker.state === "blocked",
    confirmBlocker,
    cancelBlocker,
  };
};

export default useChat;
