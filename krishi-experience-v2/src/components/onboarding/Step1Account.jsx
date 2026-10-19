import React, { useState } from "react";
import { Eye, EyeOff, UserCheck, ShieldCheck, Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";

export function Step1Account({
  account,
  onChange,
  onNext,
  onOpenLogin,
  errors = {},
  isSubmitting = false,
  serverError = null
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card overflow-hidden">
      {/* Reassuring Header Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-primary p-6 sm:p-8 text-white relative">
        <div className="max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-brand-mint text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to the new Krishi AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight mb-2">
            Let's Set Up Your Farmer Account
          </h1>
          <p className="text-brand-mint/90 text-sm sm:text-base leading-relaxed">
            Set up your farmer profile in a few steps. Your answers will help prepare personalized guidance for a later phase.
          </p>
        </div>

        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center justify-center w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center p-3">
          <ShieldCheck className="w-8 h-8 text-brand-leaf mb-1" />
          <span className="text-[11px] font-semibold text-white leading-tight">
            100% Secure &amp; Confidential
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start space-x-2">
            <span className="font-semibold text-amber-700">Notice:</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={account.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                placeholder="e.g. Ramesh"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.firstName
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.firstName && (
              <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={account.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                placeholder="e.g. Patel"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.lastName
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.lastName && (
              <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={account.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="farmer@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                errors.email
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
              }`}
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email ? (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          ) : (
            <p className="text-xs text-stone-500 mt-1">
              Used for account recovery and receiving critical crop weather alerts.
            </p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={account.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="At least 6 characters"
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.password
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={account.confirmPassword}
                onChange={(e) => onChange({ confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.confirmPassword
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Terms & Privacy Acknowledgment */}
        <div className="pt-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={account.termsAccepted}
              onChange={(e) => onChange({ termsAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-brand-green focus:ring-brand-emerald border-stone-300"
            />
            <span className="text-xs text-stone-600 leading-normal">
              I agree to the{" "}
              <span className="font-semibold text-brand-green">Terms of Service</span> and acknowledge that my farm details will be processed responsibly according to the{" "}
              <span className="font-semibold text-brand-green">Privacy Policy</span>. Plaintext passwords are never stored in your browser.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-xs text-red-600 mt-1">{errors.termsAccepted}</p>
          )}
        </div>

        {/* Action Button & Login link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Creating Farmer Account...</span>
            ) : (
              <>
                <span>Create Account &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-xs text-stone-500 text-center sm:text-right">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={onOpenLogin}
              className="font-bold text-brand-green hover:underline hover:text-brand-emerald"
            >
              Log In here
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
