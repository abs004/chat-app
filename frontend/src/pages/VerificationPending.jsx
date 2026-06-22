import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { resendVerification } from "../services/api/authApi.js";

export default function VerificationPending() {
  const { state } = useLocation();
  const email = state?.email || "";

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer after a resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await resendVerification(email);
      setStatus("success");
      setCooldown(60);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4">
      {/* Google font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111418] border border-[#1f2328] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

          <div className="p-10">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>

            {/* Heading */}
            <p
              className="text-xs font-semibold text-emerald-500 tracking-widest uppercase mb-2"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Almost there
            </p>
            <h1
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Check your inbox
            </h1>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6">
              We've sent a verification link to{" "}
              {email ? (
                <span className="text-emerald-400 font-medium">{email}</span>
              ) : (
                "your college email"
              )}
              . Click the link in that email to activate your account.
            </p>

            <p className="text-[#6b7280] text-xs leading-relaxed mb-8">
              Didn't receive it? Check your spam folder, or click below to resend.
            </p>

            {/* Status messages */}
            {status === "success" && (
              <div className="flex items-start gap-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-4 py-3 mb-5">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-emerald-300 text-sm">Verification email resent successfully!</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Resend button */}
            <button
              id="resend-verification-btn"
              type="button"
              onClick={handleResend}
              disabled={status === "loading" || cooldown > 0}
              className="w-full py-3 px-6 text-sm font-semibold text-white bg-emerald-500 rounded-xl transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] mb-4"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </span>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Resend verification email"
              )}
            </button>

            <p className="text-center text-sm text-[#6b7280]">
              Already verified?{" "}
              <Link to="/login" className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
