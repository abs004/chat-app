/**
 * Full-screen overlay displayed while waiting for a match.
 * Rendered in place of the chat UI when isMatching is true.
 */
const MatchingScreen = ({ onCancel }) => (
  <div className="flex h-screen bg-[#0d1a12] text-[#e2f0e2] justify-center items-center flex-col overflow-hidden font-sans">
    {/* Logo icon */}
    <div className="w-16 h-16 bg-[#22c55e] rounded-lg flex items-center justify-center mb-4">
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 text-white">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    </div>

    <h2 className="text-white text-2xl font-semibold">Finding a match...</h2>
    <p className="text-[#6b9e7d] mt-2 text-sm">
      Waiting for another stranger to join.
    </p>

    <button
      id="cancel-match-btn"
      onClick={onCancel}
      className="mt-8 px-6 py-3 rounded-lg border border-red-500 text-red-500 bg-transparent cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-red-500 hover:text-white"
    >
      Cancel
    </button>
  </div>
);

export default MatchingScreen;
