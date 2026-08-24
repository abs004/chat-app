import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvatarUrl } from "../utils/avatarUtils.js";


function AmbientDots() {

  const dots = [
    { cx: "8%", cy: "15%", r: 3, delay: 0, dur: 5 },
    { cx: "88%", cy: "12%", r: 2, delay: 1.5, dur: 4.5 },
    { cx: "20%", cy: "60%", r: 4, delay: 0.8, dur: 6 },
    { cx: "70%", cy: "75%", r: 2.5, delay: 2, dur: 5 },
    { cx: "92%", cy: "45%", r: 3, delay: 0.3, dur: 5.5 },
    { cx: "50%", cy: "88%", r: 2, delay: 1.2, dur: 4 },
    { cx: "5%", cy: "80%", r: 3.5, delay: 2.5, dur: 6 },
    { cx: "78%", cy: "28%", r: 2, delay: 0.6, dur: 5 },
    { cx: "35%", cy: "8%", r: 2.5, delay: 1.8, dur: 4.5 },
    { cx: "60%", cy: "50%", r: 3, delay: 0.4, dur: 5.5 },
    { cx: "15%", cy: "40%", r: 2, delay: 2.2, dur: 4 },
    { cx: "45%", cy: "30%", r: 2, delay: 1, dur: 6.5 },
    { cx: "82%", cy: "62%", r: 3, delay: 0.9, dur: 5 },
    { cx: "28%", cy: "82%", r: 2.5, delay: 1.6, dur: 4.5 },
  ];

  const lines = [
    ["8%", "15%", "20%", "60%"],
    ["20%", "60%", "50%", "88%"],
    ["88%", "12%", "78%", "28%"],
    ["78%", "28%", "92%", "45%"],
    ["70%", "75%", "82%", "62%"],
    ["35%", "8%", "45%", "30%"],
    ["60%", "50%", "70%", "75%"],
  ];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dotGradL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.1" />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="url(#dotGradL)">
          <animate attributeName="opacity" values="0.15;0.8;0.15" dur={`${d.dur}s`} begin={`${d.delay}s`} repeatCount="indefinite" />
          <animate attributeName="r" values={`${d.r};${d.r * 2};${d.r}`} dur={`${d.dur}s`} begin={`${d.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
      </svg>
    ),
    title: "Anonymous by default",
    desc: "No usernames shown. Just two people talking.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Campus-only",
    desc: "Only verified students from your college can join.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant match",
    desc: "Get paired with a random student in seconds.",
  },
];

export default function ChatLanding() {
  const navigate = useNavigate();
  const { logout, isAdmin, avatarSeed } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-[#0D0F12] text-white relative overflow-hidden"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <AmbientDots />

      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg tracking-tight leading-tight">G-Chat</span>
            <span className="text-[#6B7280] text-xs font-normal tracking-normal">GEC Chat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <a href="/admin"
              className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10 transition-colors duration-150 mr-2"
            >
              Admin Dashboard
            </a>
          )}

          <button
            onClick={() => navigate("/settings")}
            title="Settings"
            className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer border-0 bg-transparent"
          >
            <img 
              src={getAvatarUrl(avatarSeed)} 
              alt="Avatar" 
              className="w-5 h-5 object-cover"
            />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer border-0 bg-transparent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl">
          Talk to someone<br />
          <span className="text-emerald-400">you've never met.</span>
        </h1>

        <p className="text-[#6B7280] text-base sm:text-lg max-w-md mb-12 leading-relaxed">
          Random one-on-one chats with students from your campus. Anonymous, instant, and just for your college.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/chat")}
          className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-0"
        >
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Start chatting
        </button>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-left hover:bg-white/[0.06] transition-colors duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
              <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}