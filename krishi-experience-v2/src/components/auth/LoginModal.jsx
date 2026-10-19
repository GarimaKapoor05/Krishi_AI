import React, { useState } from "react";
import { X, Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from "lucide-react";
import { authService } from "../../services/authService";

export function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      setSuccess(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess && onLoginSuccess(res.data?.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-elevated w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-brand-mint text-brand-green">
            <LogIn className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Farmer Login</h3>
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Access your existing Krishi AI account and registered farm profile.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Logged in successfully! Loading profile...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kisan@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-mint/60 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-mint/60 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Krishi AI</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-500">
            First time farmer on Krishi AI?{" "}
            <button
              type="button"
              onClick={onClose}
              className="text-brand-green font-semibold hover:underline"
            >
              Continue Onboarding
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
