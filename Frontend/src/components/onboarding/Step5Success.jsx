import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sprout, RotateCcw, ArrowRight } from "lucide-react";

export function Step5Success({ profile, completionResult, onReset }) {
  const farmerName = [profile?.account?.firstName, profile?.account?.lastName]
    .filter(Boolean)
    .join(" ");
  const location = [profile?.farmLocation?.village, profile?.farmLocation?.district]
    .filter(Boolean)
    .join(", ");

  const isCultivating = profile?.farmingStatus === "active";
  const cropName = isCultivating
    ? profile?.activeFarming?.cropName
    : profile?.planningFarming?.interestedCrops?.[0] || profile?.planningFarming?.plannedSowingPeriod;

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-labelledby="onboarding-success-title">
      <div className="bg-emerald-800 px-6 py-9 text-center text-white sm:px-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <CheckCircle2 className="h-9 w-9 text-emerald-200" aria-hidden="true" />
        </div>
        <h1 id="onboarding-success-title" className="text-2xl font-extrabold sm:text-3xl">Your farm profile is ready</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/90">
          Thank you{farmerName ? `, ${farmerName}` : ""}. Your crop plan has been saved and your personalized farm dashboard is ready.
        </p>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-stone-900">Your personalized crop calendar is active</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              {cropName
                ? `We have prepared your task calendar for ${cropName}. You can now view dated field actions, irrigation intervals, and 7-day weather.`
                : "Your answers are ready on your farm dashboard with a dated task calendar and local weather."}
            </p>
          </div>
        </div>

        {location && (
          <p className="text-sm text-stone-600"><span className="font-semibold text-stone-800">Farm location:</span> {location}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-stone-200 pt-5">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-900 shadow-sm"
          >
            <span>Go to your dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start another profile
          </button>
        </div>
      </div>
    </section>
  );
}
