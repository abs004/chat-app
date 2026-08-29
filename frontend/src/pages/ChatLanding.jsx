import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvatarUrl } from "../utils/avatarUtils.js";
import { Menu, X, User, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { getToken } from "../utils/token.js";
import { API_BASE_URL } from "../constants/config.js";
import { MessageSquare } from "lucide-react";

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

// ── Feedback Modal ────────────────────────────────────────────────────────────

function FeedbackModal({ authenticatedFetch, onClose }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback");
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111418] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-2xl" style={{ fontFamily: "'Sora', sans-serif" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Share your feedback</p>
            <p className="text-[#6B7280] text-xs mt-0.5">Help us improve G-Chat</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <textarea
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4B5563] resize-none outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <span className="text-[#4B5563] text-[0.65rem] text-right">{comment.length}/1000</span>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!comment.trim() || loading}
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-all border-none cursor-pointer shadow-[0_4px_14px_rgba(16,185,129,0.25)]"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {loading ? "Sending..." : "Send Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatLanding() {
  const navigate = useNavigate();
  const { logout, isAdmin, avatarSeed, authenticatedFetch } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const token = getToken();
  const email = token ? JSON.parse(atob(token.split('.')[1]))?.email : null;
  const username = email ? email.split("@")[0] : "Student";

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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => navigate("/admin")}
              className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10 transition-colors duration-150 mr-2 bg-transparent cursor-pointer"
            >
              Admin Dashboard
            </button>
          )}

          <button
            onClick={() => navigate("/settings")}
            title="Change Avatar"
            className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer border-0 bg-transparent"
          >
            <img 
              src={getAvatarUrl(avatarSeed)} 
              alt="Avatar" 
              className="w-5 h-5 object-cover"
            />
            <span>Change Avatar</span>
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer border-0 bg-transparent"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex md:hidden text-white p-2 bg-transparent border-none cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-[#111418] border-l border-white/[0.08] z-50 flex flex-col p-6 md:hidden transition-transform duration-300 ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-5 right-5 text-[#9CA3AF] hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mt-6">
              <img
                src={getAvatarUrl(avatarSeed)}
                alt="Avatar"
                className="w-16 h-16 object-cover mb-3"
              />
              <span className="text-white font-semibold text-sm">{username}</span>
            </div>

            <div className="border-t border-white/[0.08] my-4 w-full" />

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => { setDrawerOpen(false); navigate("/settings"); }}
                className="flex items-center gap-3 w-full text-left text-sm text-[#9CA3AF] hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
              >
                <User size={18} />
                Change Avatar
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => { setDrawerOpen(false); navigate("/admin"); }}
                  className="flex items-center gap-3 w-full text-left text-sm text-[#9CA3AF] hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
                >
                  <LayoutDashboard size={18} />
                  Admin Dashboard
                </button>
              )}

              <button
                onClick={() => { setDrawerOpen(false); setFeedbackOpen(true); }}
                className="flex items-center gap-3 w-full text-left text-sm text-[#9CA3AF] hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
              >
                <MessageSquare size={18} />
                Give Feedback
              </button>

              <div className="border-t border-white/[0.08] my-2 w-full" />

              <button
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
                className="flex items-center gap-3 w-full text-left text-sm text-red-400 hover:text-red-300 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

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

      {/* Feedback button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="hidden md:flex fixed bottom-5 right-5 z-30 flex items-center gap-1.5 text-[#6B7280] hover:text-white text-sm transition-colors cursor-pointer border-none bg-transparent"
      >
        <MessageSquare size={15} />
        Give Feedback
      </button>

      {feedbackOpen && <FeedbackModal authenticatedFetch={authenticatedFetch} onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}