/**
 * Sidebar for the chat page.
 * Contains the logo, user profile, navigation items, safety card,
 * and bottom icon buttons.
 */
const ChatSidebar = ({ userId }) => (
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
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || "alex"}`}
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
      <button className="sidebar-nav-item active" id="nav-1v1">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        1v1 Chat
      </button>
      <button className="sidebar-nav-item" id="nav-interests">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
        Interests
      </button>
      <button className="sidebar-nav-item" id="nav-privacy">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Privacy Settings
      </button>
    </nav>

    {/* Safety Card */}
    <div className="sidebar-safety-card">
      <p className="safety-title">Safety Guidelines</p>
      <p className="safety-text">
        Stay safe. Don&apos;t share personal info with strangers.
      </p>
      <button className="report-btn" id="report-user-btn">
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          className="report-icon"
        >
          <path
            fillRule="evenodd"
            d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
            clipRule="evenodd"
          />
        </svg>
        Report User
      </button>
    </div>

    {/* Bottom icons */}
    <div className="sidebar-bottom">
      <button className="sidebar-icon-btn" title="Settings" id="settings-btn">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
      <button className="sidebar-icon-btn" title="Help" id="help-btn">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  </aside>
);

export default ChatSidebar;
