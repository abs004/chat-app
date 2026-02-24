import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Chat.css';

const API_BASE_URL = 'http://localhost:3000';

export default function Chat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [isMatching, setIsMatching] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Get current user ID from token on load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Decode token to get userId (simple decode, not verification)
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            setUserId(decoded.userId);
        } catch (e) {
            console.error("Token decode error", e);
            navigate('/login');
        }
    }, [navigate]);

    // ── SOCKET INITIALIZATION ────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Connect to socket server
        const socket = io(API_BASE_URL, {
            auth: { token }
        });
        socketRef.current = socket;

        // Socket Listeners
        socket.on('match-found', (data) => {
            setConversationId(data.conversationId);
            setIsMatching(false);
            setIsActive(true);

            // Fetch history when match is found
            fetchHistory(data.conversationId);
        });

        socket.on('receive-message', (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        socket.on('partner-disconnected', () => {
            setIsActive(false);
        });

        socket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
        });

        // Request a match immediately
        socket.emit('match-me');

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchHistory = async (convId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/messages/${convId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.status === 200) {
                setMessages(data.messages || []);
                setIsActive(data.isActive);
            }
        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !conversationId || !isActive) return;

        const content = input.trim();
        setInput('');

        // Send via socket
        socketRef.current?.emit('send-message', {
            conversationId,
            content
        });
    };

    const handleEnd = () => {
        socketRef.current?.emit('leave-chat', { conversationId });
        navigate('/chat-landing');
    };

    const handleNext = () => {
        socketRef.current?.emit('leave-chat', { conversationId });
        setConversationId(null);
        setIsMatching(true);
        setMessages([]);
        setIsActive(true);
        socketRef.current?.emit('match-me');
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isMatching) {
        return (
            <div className="chat-page" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div className="sidebar-logo-icon" style={{ width: '4rem', height: '4rem', marginBottom: '1rem' }}>
                    <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem' }}>
                        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                    </svg>
                </div>
                <h2 style={{ color: '#fff' }}>Finding a match...</h2>
                <p style={{ color: '#6b9e7d', marginTop: '0.5rem' }}>Waiting for another stranger to join.</p>
                <button
                    onClick={handleEnd}
                    style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
            <aside className="chat-sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                        </svg>
                    </div>
                    <span>ChatApp</span>
                </div>

                {/* User Profile */}
                <div className="sidebar-profile">
                    <img
                        className="sidebar-avatar"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'alex'}`}
                        alt="Your avatar"
                    />
                    <div>
                        <p className="sidebar-username">You</p>
                        <p className="sidebar-status">
                            <span className="online-dot" />
                            Online
                        </p>
                    </div>
                </div>

                {/* Main Menu */}
                <p className="sidebar-section-label">MAIN MENU</p>
                <nav className="sidebar-nav">
                    <button className="sidebar-nav-item active">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        1v1 Chat
                    </button>
                    <button className="sidebar-nav-item">
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        Interests
                    </button>
                    <button className="sidebar-nav-item">
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Privacy Settings
                    </button>
                </nav>

                {/* Safety Card */}
                <div className="sidebar-safety-card">
                    <p className="safety-title">Safety Guidelines</p>
                    <p className="safety-text">Stay safe. Don't share personal info with strangers.</p>
                    <button className="report-btn">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="report-icon">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                        </svg>
                        Report User
                    </button>
                </div>

                {/* Bottom icons */}
                <div className="sidebar-bottom">
                    <button className="sidebar-icon-btn" title="Settings">
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button className="sidebar-icon-btn" title="Help">
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CHAT AREA ───────────────────────────────────── */}
            <main className="chat-main">
                {/* Stranger pill */}
                <div className="chat-stranger-banner">
                    {isActive ? "YOU ARE NOW CHATTING WITH A RANDOM STRANGER" : "PARTNER HAS DISCONNECTED"}
                </div>

                {/* Message list */}
                <div className="chat-messages">
                    {!isActive && messages.length > 0 && (
                        <div style={{ textAlign: 'center', margin: '1rem', color: '#6b9e7d', fontSize: '0.8rem' }}>
                            Conversation ended.
                        </div>
                    )}

                    {messages.map((msg) =>
                        msg.sender !== userId ? (
                            <div className="msg-row msg-row--left" key={msg._id}>
                                <img className="msg-avatar" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner`} alt="stranger" />
                                <div className="msg-bubble-wrap">
                                    <div className="msg-bubble msg-bubble--stranger">{msg.content}</div>
                                    <span className="msg-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="msg-row msg-row--right" key={msg._id}>
                                <div className="msg-bubble-wrap msg-bubble-wrap--right">
                                    <div className="msg-bubble msg-bubble--me">{msg.content}</div>
                                    <span className="msg-time msg-time--right">{formatTime(msg.createdAt)}</span>
                                </div>
                                <img className="msg-avatar" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="me" />
                            </div>
                        )
                    )}

                    {/* Typing indicator */}
                    {isTyping && isActive && (
                        <div className="msg-row msg-row--left">
                            <img
                                className="msg-avatar"
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=partner"
                                alt="stranger typing"
                            />
                            <div className="typing-indicator">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── BOTTOM BAR ──────────────────────────────────────── */}
                <div className="chat-input-bar">
                    <div className="chat-input-row">
                        <button
                            className="end-btn"
                            onClick={handleEnd}
                        >
                            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            End
                        </button>

                        <input
                            className="chat-input"
                            type="text"
                            placeholder={isActive ? "Type a message..." : "Conversation ended"}
                            disabled={!isActive}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            className="send-btn"
                            onClick={sendMessage}
                            disabled={!isActive}
                            aria-label="Send"
                            style={{ opacity: isActive ? 1 : 0.5 }}
                        >
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>

                        <button className="next-btn" onClick={handleNext}>
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                            </svg>
                            Next
                        </button>
                    </div>

                    <div className="chat-toolbar">
                        <button className="toolbar-btn">
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Emoji
                        </button>
                        <button className="toolbar-btn">
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Image
                        </button>
                        <span className="searching-label">
                            Searching for:{' '}
                            <span className="searching-tags">Music, Gaming, Tech</span>
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

