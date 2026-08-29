/**
 * Full-screen overlay displayed while waiting for a match.
 */
const MatchingScreen = ({ onCancel }) => (
  <div
    className="flex h-screen bg-[#0D0F12] text-white justify-center items-center flex-col overflow-hidden"
    style={{ fontFamily: "'Sora', sans-serif" }}
  >
    {/* Animated rings */}
    <div className="relative flex items-center justify-center mb-10">
      <span className="absolute w-28 h-28 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: "2s" }} />
      <span className="absolute w-20 h-20 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
      <img src="/logo.png" alt="G-Chat" className="h-14 w-auto" />
    </div>

    <h2 className="text-2xl font-bold text-white mb-2">Finding someone…</h2>
    <p className="text-[#6B7280] text-sm mb-10">Looking for a student to connect you with</p>

    {/* Animated dots */}
    <div className="flex items-center gap-1.5 mb-10">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          style={{
            animation: "matchDot 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>

    <button
      onClick={onCancel}
      className="px-6 py-2.5 rounded-xl border border-white/10 text-[#9CA3AF] bg-white/5 text-sm font-medium cursor-pointer transition-all duration-200 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5"
    >
      Cancel
    </button>

    <style>{`
      @keyframes matchDot {
        0%, 60%, 100% { opacity: 0.2; transform: scaleY(1); }
        30% { opacity: 1; transform: scaleY(1.6); }
      }
    `}</style>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
  </div>
);

export default MatchingScreen;