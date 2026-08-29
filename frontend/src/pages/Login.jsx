import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/api/authApi.js";
import { Eye, EyeOff } from "lucide-react";

// Floating ambient dots for the left panel
function AmbientDots() {
  const dots = [
    { cx: "15%", cy: "20%", r: 3, delay: 0, dur: 4 },
    { cx: "75%", cy: "15%", r: 2, delay: 1.5, dur: 5 },
    { cx: "30%", cy: "55%", r: 4, delay: 0.8, dur: 6 },
    { cx: "60%", cy: "70%", r: 2.5, delay: 2, dur: 4.5 },
    { cx: "85%", cy: "40%", r: 3, delay: 0.3, dur: 5.5 },
    { cx: "45%", cy: "85%", r: 2, delay: 1.2, dur: 4 },
    { cx: "20%", cy: "75%", r: 3.5, delay: 2.5, dur: 6 },
    { cx: "70%", cy: "30%", r: 2, delay: 0.6, dur: 5 },
    { cx: "10%", cy: "45%", r: 2.5, delay: 1.8, dur: 4.5 },
    { cx: "55%", cy: "10%", r: 3, delay: 0.4, dur: 5.5 },
    { cx: "90%", cy: "80%", r: 2, delay: 2.2, dur: 4 },
    { cx: "40%", cy: "35%", r: 2, delay: 1, dur: 6.5 },
  ];

  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="url(#dotGrad)">
          <animate
            attributeName="opacity"
            values="0.2;0.9;0.2"
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${d.r};${d.r * 1.8};${d.r}`}
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {/* Connecting lines */}
      <line x1="15%" y1="20%" x2="30%" y2="55%" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="30%" y1="55%" x2="60%" y2="70%" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.1" />
      <line x1="75%" y1="15%" x2="70%" y2="30%" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="60%" y1="70%" x2="45%" y2="85%" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.1" />
      <line x1="85%" y1="40%" x2="70%" y2="30%" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.12" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login: storeAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data  = await login(email, password);
      storeAuth(data.token, data.isAdmin ?? false, data.avatarSeed ?? "default");
      
      if (data.hasAcceptedTerms === false) {
        localStorage.setItem("termsAccepted", "false");
        navigate("/terms");
      } else {
        localStorage.setItem("termsAccepted", "true");
        navigate("/chat-landing");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] min-h-[520px] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex">

        {/* Left panel — dark, ambient */}
        <div className="relative hidden md:flex flex-col justify-between w-[45%] bg-[#111418] p-10 overflow-hidden">
          <AmbientDots />

          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-0 mb-3">
            <img src="/logo.png" alt="G-Chat" className="h-14 w-auto -mr-3" />
            <div className="flex flex-col">
             <span className="text-white font-semibold text-lg tracking-tight leading-tight" style={{fontFamily: "'Sora', sans-serif"}}>
              G-Chat
             </span>
             <span className="text-[#6B7280] text-xs font-normal tracking-normal" style={{fontFamily: "'Sora', sans-serif"}}>
               GEC Chat
             </span>
            </div>
            </div>
          </div>

          {/* Middle copy */}
          <div className="relative z-10">
            <p className="text-4xl font-bold text-white leading-tight mb-4" style={{fontFamily: "'Sora', sans-serif"}}>
              Meet someone<br />
              <span className="text-emerald-400">new today.</span>
            </p>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Random connections with people from your campus. No profiles, no filters — just real conversations.
            </p>
          </div>

          {/* Online indicator */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[#6B7280] text-xs">People online right now</span>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-white flex flex-col justify-center px-10 py-12">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <img src="/logo.png" alt="G-Chat" className="h-14 w-auto" />
            <span className="text-gray-900 font-semibold text-base" style={{fontFamily: "'Sora', sans-serif"}}>G-Chat</span>
          </div>

          <p className="text-xs font-semibold text-emerald-500 tracking-widest uppercase mb-2">Welcome back</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{fontFamily: "'Sora', sans-serif"}}>
            Sign in
          </h2>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="user@gecskp.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all duration-150 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 pr-11 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all duration-150 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                 <Link to="/forgot-password" className="text-xs font-medium !text-emerald-600 hover:!text-emerald-700">
                 Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 text-sm font-semibold text-white bg-emerald-500 rounded-xl transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            No account?{" "}
            <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Google font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}