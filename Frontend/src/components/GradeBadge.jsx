const STYLES = {
  A: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  B: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  C: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  "Needs review":
    "bg-stone-200 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
};

const LABELS = {
  A: "Grade A",
  B: "Grade B",
  C: "Grade C",
  "Needs review": "Needs review",
};

export default function GradeBadge({ grade, confidence, size = "md" }) {
  const key = STYLES[grade] ? grade : "Needs review";
  const sizeCls =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : "text-xs sm:text-sm px-3 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-extrabold ${sizeCls} ${STYLES[key]}`}
      title="AI-assisted visual grading (not lab or government certified)"
    >
      <span>{LABELS[key]}</span>
      {confidence != null && key !== "Needs review" && (
        <span className="font-semibold opacity-70">· {confidence}%</span>
      )}
    </span>
  );
}
