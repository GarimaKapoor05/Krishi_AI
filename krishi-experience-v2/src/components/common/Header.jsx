import React from "react";
import { LogIn, Sprout } from "lucide-react";

export function Header({ onOpenLogin }) {
  return (
    <header className="border-b border-brand-border bg-brand-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3" aria-label="Krishi AI">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-brand-mint">
            <Sprout className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-brand-green">Krishi AI</span>
            <p className="text-[11px] text-stone-500">Farmer-first onboarding</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLogin}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-sm font-semibold text-brand-green hover:bg-brand-mint/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          Log in
        </button>
      </div>
    </header>
  );
}
