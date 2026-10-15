import {
  AlertTriangle,
  CheckCircle2,
  Languages,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import GradeBadge from "./GradeBadge";

const INSPECTION_LABELS = {
  color_uniformity: "Colour uniformity",
  surface_blemishes: "Surface blemishes",
  apparent_freshness: "Apparent freshness",
  foreign_matter_or_dirt: "Foreign matter / dirt",
};

function InspectionPill({ label, value }) {
  const good = ["High", "None", "Freshly Harvested", "Clean", "Good"];
  const bad = ["Low", "Severe", "Stale", "High"];
  const tone = good.includes(value)
    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
    : bad.includes(value)
      ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <div className={`rounded-xl px-3 py-2 ${tone}`}>
      <p className="text-[10px] uppercase tracking-wide font-bold opacity-70">{label}</p>
      <p className="text-sm font-extrabold">{value || "—"}</p>
    </div>
  );
}

export default function GradeReportCard({ report, imageUrl, compact = false }) {
  if (!report) return null;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {imageUrl && (
          <div className="sm:w-56 shrink-0 bg-stone-100 dark:bg-stone-800">
            <img
              src={imageUrl}
              alt="Graded harvest"
              className="w-full h-48 sm:h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <GradeBadge
              grade={report.suggested_grade}
              confidence={report.confidence_score}
            />
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Confidence: {report.confidence_band}
            </span>
          </div>

          <div>
            <p className="text-sm font-bold text-stone-900 dark:text-white">
              {report.quality_summary}
            </p>
            <p
              className="text-sm text-stone-600 dark:text-stone-300 mt-1"
              lang="hi"
            >
              {report.quality_summary_hi}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(report.visual_inspection || {}).map(([k, v]) => (
              <InspectionPill key={k} label={INSPECTION_LABELS[k] || k} value={v} />
            ))}
          </div>

          {!compact && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600" />
                    Quality highlights
                  </p>
                  <ul className="space-y-1.5">
                    {(report.quality_highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300"
                      >
                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600" />
                    Caution flags
                  </p>
                  <ul className="space-y-1.5">
                    {(report.caution_flags || []).map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300"
                      >
                        <ShieldAlert size={14} className="text-amber-600 mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-stone-50 dark:bg-stone-800/50 p-3">
                  <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-1.5 flex items-center gap-1.5">
                    <Languages size={13} className="text-sky-600" />
                    Listing description
                  </p>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {report.listing_description}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2" lang="hi">
                    {report.listing_description_hi}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 p-3">
                  <p className="text-[11px] uppercase tracking-wide font-bold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <Lightbulb size={13} />
                    Tips to improve this lot
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {(report.farmer_tips || []).map((t, i) => (
                      <li key={i} className="text-xs text-stone-700 dark:text-stone-300">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
