import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/api/authApi.js";

export default function Login() {
  const navigate = useNavigate();
  const { login: storeAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await login(email, password);
      storeAuth(data.token);
      navigate("/chat-landing");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-600 to-cyan-600 flex items-center justify-center p-5">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-10 w-full max-w-[440px] transition-all duration-300 hover:shadow-[0_25px_70px_rgba(4,120,87,0.4)] hover:-translate-y-0.5">
        <h1
          className="font-[cursive] text-5xl font-extrabold text-center mb-2.5 bg-gradient-to-br from-emerald-700 to-emerald-600 bg-clip-text text-transparent"
          style={{ WebkitTextFillColor: "transparent" }}
        >
          Chat App
        </h1>
        <h2 className="text-2xl font-semibold font-[Book_Antiqua,serif] text-gray-600 text-center mb-8">
          <b>Login</b>
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 text-base bg-gray-50 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 placeholder-gray-400 focus:border-emerald-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(4,120,87,0.1)] disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 text-base bg-gray-50 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 placeholder-gray-400 focus:border-emerald-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(4,120,87,0.1)] disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 text-base font-semibold text-white bg-gradient-to-br from-emerald-700 to-emerald-600 border-none rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(4,120,87,0.4)] transition-all duration-200 mt-2.5 hover:shadow-[0_6px_20px_rgba(4,120,87,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
          New user?{" "}
          <Link
            to="/signup"
            className="text-emerald-700 font-semibold hover:text-emerald-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}