import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, Mail, Lock, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { API_URL } from "../config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        login(data.access_token, data.user);
        navigate("/user-dashboard", { replace: true });
      } else {
        setError(data.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err) {
      setError("Unable to connect to KrishiAI server. Please verify your connection.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center px-4 sm:px-6 py-28 relative overflow-hidden transition-colors">
      {/* Decorative ambient gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-950/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 dark:bg-amber-950/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-lg shadow-emerald-900/15 group-hover:scale-105 transition-transform">
              <Sprout size={30} className="text-emerald-300" />
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
            </h1>
          </Link>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm font-medium">
            Empowering Farmers with Intelligent Agricultural Decisions
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-8 sm:p-10"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white">
              Farmer Login 👋
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
              Sign in to view your farm history, soil advisories, and mandi price alerts.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 px-4 py-3 rounded-2xl mb-6 text-xs sm:text-sm font-medium flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                Email Address
              </label>
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <Mail size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm placeholder:font-normal placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                Password
              </label>
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <Lock size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm placeholder:font-normal placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white py-4 rounded-2xl font-bold text-sm sm:text-base shadow-md shadow-emerald-900/15 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to KrishiAI</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-center space-y-2">
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              New to KrishiAI?{" "}
              <Link
                to="/register"
                className="text-emerald-800 dark:text-emerald-400 font-extrabold hover:underline"
              >
                Register Your Farm Account
              </Link>
            </p>
            <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              Secure JWT encryption for farmer privacy
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-bold text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition"
          >
            ← Back to KrishiAI Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;