/**
 * Full-screen overlay displayed while waiting for a match.
 * Rendered in place of the chat UI when isMatching is true.
 */
const MatchingScreen = ({ onCancel }) => (
  <div
    className="chat-page"
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}
  >
    <div
      className="sidebar-logo-icon"
      style={{ width: "4rem", height: "4rem", marginBottom: "1rem" }}
    >
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        style={{ width: "2rem", height: "2rem" }}
      >
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    </div>
    <h2 style={{ color: "#fff" }}>Finding a match...</h2>
    <p style={{ color: "#6b9e7d", marginTop: "0.5rem" }}>
      Waiting for another stranger to join.
    </p>
    <button
      id="cancel-match-btn"
      onClick={onCancel}
      style={{
        marginTop: "2rem",
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #ef4444",
        color: "#ef4444",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
  </div>
);

export default MatchingScreen;
