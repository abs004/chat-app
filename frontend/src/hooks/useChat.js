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
  const { userId, authenticatedFetch } = useAuth();
  const socketRef = useSocket();

  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [partnerUserId, setPartnerUserId] = useState(null);
  const [partnerAvatarSeed, setPartnerAvatarSeed] = useState(null);
  // Ref so event handlers / beforeunload / blocker always read the latest
  // conversationId without stale closures.
  const conversationIdRef = useRef(null);
  const [isMatching, setIsMatching] = useState(true);
  const isMatchingRef = useRef(true); // Track for reconnect handler
  const cancelledRef = useRef(false);
  const [isActive, setIsActive] = useState(true);
  const [localEnded, setLocalEnded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);


  // ── Helper: emit leave-chat once and clear the ref ───────────────────────
  // Centralising emission here guarantees the ref is always nulled afterward
  // so duplicate emissions are impossible regardless of which code path fires.
  const emitLeaveChat = useCallback((convId) => {
    if (convId === undefined) return;
    socketRef.current?.emit("leave-chat", { conversationId: convId });
    conversationIdRef.current = null;
  }, [socketRef]);

  // ── Load message history when a match is found ───────────────────────────
  const loadHistory = useCallback(async (convId, liveMatch = false) => {
    try {
      const { messages: history, isActive: active } =
        await fetchMessages(convId, authenticatedFetch);
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
  }, [authenticatedFetch]);

  // ── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onMatchFound = ({ conversationId: convId, partnerUserId: pid, partnerAvatarSeed: pas }) => {
      setConversationId(convId);
      setPartnerUserId(pid);
      setPartnerAvatarSeed(pas || null);
      conversationIdRef.current = convId;   // keep ref in sync
      setIsMatching(false);
      isMatchingRef.current = false;
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
    const onConnectError = (err) => console.error("[Socket] connection error:", err.message);

    // Re-emit match-me if the socket drops and reconnects
    const onConnect = () => {
      if (cancelledRef.current) return;
      if (isMatchingRef.current || conversationIdRef.current) {
        socket.emit("match-me");
      }
    };

    socket.on("match-found", onMatchFound);
    socket.on("receive-message", onReceiveMessage);
    socket.on("partner-disconnected", onPartnerDisconnected);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    socket.on("connect_error", onConnectError);
    socket.on("connect", onConnect);

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
      socket.off("connect_error", onConnectError);
      socket.off("connect", onConnect);
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
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [emitLeaveChat]);

  // ── useBlocker — intercept in-app navigation ─────────────────────────────
  // IMPORTANT: the shouldBlock function MUST be stable (not recreated each render).
  // Closing over `isActive` (state) directly causes RR v7 to re-register the blocker
  // on every render → render loop → blank screen.
  // Solution: store the condition in a ref; the callback reads the ref and is
  // defined once with useCallback so React Router sees a single stable reference.
  const shouldBlockRef = useRef(false);
  shouldBlockRef.current =
    isActive && conversationIdRef.current !== null && !isMatching;

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      shouldBlockRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [] // ← stable: no deps, reads ref at call time
  );

  const blocker = useBlocker(shouldBlock);

  // Confirm: user chose "Leave" — emit leave-chat then let navigation proceed
  const confirmBlocker = useCallback(() => {
    emitLeaveChat(conversationIdRef.current);
    blocker.proceed?.();
  }, [blocker, emitLeaveChat]);

  // Cancel: user chose "Stay" — reset blocker without leaving
  const cancelBlocker = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

  // ── Typing Indicator Logic ───────────────────────────────────────────────
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInput(value);

    if (!isActive || !conversationIdRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketRef.current?.emit("typing", { conversationId: conversationIdRef.current });

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { conversationId: conversationIdRef.current });
    }, 2000);
  }, [isActive, socketRef]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!input.trim() || !conversationId || !isActive || localEnded) return;
    socketRef.current?.emit("send-message", {
      conversationId,
      content: input.trim(),
    });
    setInput("");
  }, [input, conversationId, isActive, socketRef]);

  const handleEnd = useCallback(() => {
    emitLeaveChat(conversationIdRef.current);
    setLocalEnded(true);
  }, [emitLeaveChat]);

  const handleCancelMatch = useCallback(() => {
    cancelledRef.current = true;
    emitLeaveChat(null);
    setIsMatching(false);
    isMatchingRef.current = false;
    setLocalEnded(false);
  }, [emitLeaveChat]);

  const handleNext = useCallback(() => {
    cancelledRef.current = false;
    emitLeaveChat(conversationIdRef.current);
    setConversationId(null);
    setPartnerUserId(null);
    setPartnerAvatarSeed(null);
    setIsMatching(true);
    isMatchingRef.current = true;
    setMessages([]);
    setIsActive(true);
    setLocalEnded(false);
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

  const insertEmoji = useCallback((emoji) => {
    setInput((prev) => prev + (emoji.native || ""));
  }, []);

  return {
    messages,
    input,
    setInput,
    conversationId,
    isMatching,
    isActive,
    localEnded,
    isTyping,
    userId,
    partnerUserId,
    partnerAvatarSeed,
    handleInputChange,
    sendMessage,
    handleEnd,
    handleNext,
    handleCancelMatch,
    handleKeyDown,
    insertEmoji,
    // Blocker state for the confirmation modal in Chat.jsx
    isBlocking: blocker.state === "blocked",
    confirmBlocker,
    cancelBlocker,
  };
};

export default useChat;
