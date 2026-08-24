import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Sidebar for the chat page.
 */
const ChatSidebar = ({ userId, onReportClick, canReport }) => {
  const { avatarSeed } = useAuth();
  
  return (
  <aside
    className="hidden md:flex w-[240px] min-w-[240px] bg-[#111418] border-r border-white/[0.06] flex-col p-5 gap-4 overflow-y-auto"
    style={{ fontFamily: "'Sora', sans-serif" }}
  >
    {/* Logo */}
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-white font-semibold text-base tracking-tight">G-Chat</span>
    </div>

    {/* User Profile */}
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 mt-1">
      <img
        className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/40 shrink-0"
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || userId || "alex"}`}
        alt="Your avatar"
      />
      <div>
        <p className="font-semibold text-sm text-white leading-tight">You</p>
        <p className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Online
        </p>
      </div>
    </div>

    {/* Nav label */}
    <p className="text-[0.65rem] font-semibold tracking-widest text-[#4B5563] pl-1 uppercase mt-1">
      Menu
    </p>

    {/* Nav */}
    <nav className="flex flex-col gap-0.5">
      <button className="flex items-center gap-2.5 bg-emerald-500/10 border-none rounded-xl px-3 py-2.5 text-emerald-400 font-semibold text-sm cursor-pointer text-left w-full transition-all duration-200">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
        </svg>
        1v1 Chat
      </button>
    </nav>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Safety Card */}
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="font-semibold text-xs text-white">Safety reminder</p>
      </div>
      <p className="text-[0.72rem] text-[#6B7280] leading-snug mb-3">
        Never share personal info — your phone, address, or full name.
      </p>
      <button
        onClick={onReportClick}
        disabled={!canReport}
        className={`flex items-center gap-1.5 bg-transparent border-none text-xs font-semibold p-0 transition-opacity duration-200 ${
          canReport ? "text-red-400 cursor-pointer hover:opacity-70" : "text-[#4B5563] cursor-not-allowed"
        }`}
      >
        <svg fill="currentColor" viewBox="0 0 20 20" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
        </svg>
        Report this user
      </button>
    </div>
  </aside>
  );
};

export default ChatSidebar;