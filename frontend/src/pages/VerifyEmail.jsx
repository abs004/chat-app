import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail } from "../services/api/authApi.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please use the link from your email.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may be invalid or expired.");
      });
  }, [token]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/login");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4">
      {/* Google font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md">
        <div className="bg-[#111418] border border-[#1f2328] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top accent bar */}
          <div
            className={`h-1 w-full ${
              status === "error"
                ? "bg-gradient-to-r from-red-500 to-rose-400"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`}
          />

          <div className="p-10 text-center">
            {/* Loading state */}
            {status === "loading" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h1
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Verifying your email…
                </h1>
                <p className="text-[#9ca3af] text-sm">Please wait a moment.</p>
              </>
            )}

            {/* Success state */}
            {status === "success" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p
                  className="text-xs font-semibold text-emerald-500 tracking-widest uppercase mb-2"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Verified
                </p>
                <h1
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  You're all set!
                </h1>
                <p className="text-[#9ca3af] text-sm leading-relaxed mb-8">
                  {message}
                </p>

                <Link
                  to="/login"
                  id="go-to-login-btn"
                  className="inline-block w-full py-3 px-6 text-sm font-semibold text-white bg-emerald-500 rounded-xl transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98] shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] mb-4"
                >
                  Go to Login
                </Link>
                <p className="text-[#6b7280] text-xs">
                  Redirecting in {countdown}s…
                </p>
              </>
            )}

            {/* Error state */}
            {status === "error" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <p
                  className="text-xs font-semibold text-red-500 tracking-widest uppercase mb-2"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Verification failed
                </p>
                <h1
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Link invalid or expired
                </h1>
                <p className="text-[#9ca3af] text-sm leading-relaxed mb-8">
                  {message}
                </p>

                <Link
                  to="/signup"
                  id="back-to-signup-btn"
                  className="inline-block w-full py-3 px-6 text-sm font-semibold text-white bg-emerald-500 rounded-xl transition-all duration-150 hover:bg-emerald-600 active:scale-[0.98] shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] mb-4"
                >
                  Back to Sign Up
                </Link>
                <p className="text-center text-sm text-[#6b7280]">
                  Already have an account?{" "}
                  <Link to="/login" className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
