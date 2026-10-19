import React from "react";
import { CheckCircle2, Sprout, RotateCcw } from "lucide-react";

export function Step5Success({ profile, completionResult, onReset }) {
  const farmerName = [profile?.account?.firstName, profile?.account?.lastName]
    .filter(Boolean)
    .join(" ");
  const location = [profile?.farmLocation?.village, profile?.farmLocation?.district]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-card" aria-labelledby="onboarding-success-title">
      <div className="bg-brand-green px-6 py-9 text-center text-white sm:px-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <CheckCircle2 className="h-9 w-9 text-brand-mint" aria-hidden="true" />
        </div>
        <h1 id="onboarding-success-title" className="text-2xl font-extrabold sm:text-3xl">Your farm profile is ready</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85">
          Thank you{farmerName ? `, ${farmerName}` : ""}. Your answers are saved in this browser for this development version.
        </p>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-xl border border-brand-border bg-brand-cream p-4">
          <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-stone-900">Next: your personalized farming experience</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Crop recommendations and the farmer dashboard are planned for a later phase. This onboarding prototype does not generate recommendations or submit your full farm profile to the backend.
            </p>
          </div>
        </div>

        {location && (
          <p className="text-sm text-stone-600"><span className="font-semibold text-stone-800">Farm location:</span> {location}</p>
        )}

        <p className="text-xs leading-relaxed text-stone-500" role="status">
          {completionResult?.note || "Your profile is stored locally in this browser."}
        </p>

        <div className="flex flex-col gap-3 border-t border-brand-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" disabled className="cursor-not-allowed rounded-xl border border-brand-border bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-500" aria-disabled="true">
            Dashboard — planned for a later phase
          </button>
          <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start another profile
          </button>
        </div>
      </div>
    </section>
  );
}
