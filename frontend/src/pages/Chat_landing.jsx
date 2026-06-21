import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatAppLanding.css';

export default function ChatAppLanding() {
  const navigate = useNavigate();
  return (
    <div className="chat-app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="logo-text">ChatApp</span>
        </div>

        <nav className="nav">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#safety" className="nav-link">Safety</a>
        </nav>

        <button className="user-button">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <button className="start-chat-btn" onClick={() => navigate('/chat')}>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          START CHAT
        </button>
      </main>
    </div>
  );
}