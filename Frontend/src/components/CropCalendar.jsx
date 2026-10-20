import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Leaf,
  RotateCcw,
  Sprout,
} from "lucide-react";
import { buildCropCalendar, calendarDateKey, parseCalendarDate } from "../services/cropCalendar";
import { useTranslation } from "react-i18next";

const STORAGE_PREFIX = "krishi_crop_calendar_done_v1";
const prettyDate = (value, options = { day: "numeric", month: "short", year: "numeric" }, locale = "en-IN") => {
  const date = typeof value === "string" ? parseCalendarDate(value) : value;
  return date ? date.toLocaleDateString(locale, options) : "Date not set";
};
const monthLabel = (date, locale = "en-IN") => date.toLocaleDateString(locale, { month: "long", year: "numeric" });
const sameMonth = (a, b) => a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
const moveMonth = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

function TaskItem({ event, status, onToggle, compact = false }) {
  const { t, i18n } = useTranslation();
  const done = status === "done";
  const past = status === "past";
  const taskTone = event.kind === "stage"
    ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/70 dark:bg-amber-950/20"
    : event.kind === "prep"
      ? "border-violet-200 bg-violet-50/70 dark:border-violet-900/70 dark:bg-violet-950/20"
      : event.kind === "review"
        ? "border-sky-200 bg-sky-50/70 dark:border-sky-900/70 dark:bg-sky-950/20"
        : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900";
  const iconTone = event.kind === "stage"
    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
    : event.kind === "prep"
      ? "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200"
      : event.kind === "review"
        ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200"
        : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400";
  return (
    <article className={`rounded-xl border p-3 ${done ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : status === "today" ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20" : taskTone}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${done ? "bg-emerald-700 text-white" : status === "today" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200" : iconTone}`}>
          {done ? <Check size={15} /> : event.kind === "stage" ? <Sprout size={15} /> : <Circle size={13} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <h4 className={`text-sm font-bold ${done ? "text-emerald-900 dark:text-emerald-200" : "text-stone-900 dark:text-white"}`}>{event.title}</h4>
            <time className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">{prettyDate(event.date, { day: "numeric", month: "short", year: "numeric" }, i18n.resolvedLanguage)}</time>
          </div>
          {!compact && <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">{event.description}</p>}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${done ? "text-emerald-700 dark:text-emerald-300" : past ? "text-rose-700 dark:text-rose-300" : status === "today" ? "text-amber-800 dark:text-amber-200" : "text-stone-400"}`}>
              {done ? t("cropCalendar.done") : past ? t("cropCalendar.pastCheck") : status === "today" ? t("farmerDashboard.today") : event.kind === "routine" ? t("cropCalendar.fieldCheck") : t("cropCalendar.comingUp")}
            </span>
            <button type="button" onClick={() => onToggle(event.id)} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition ${done ? "text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-950/60" : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}>
              {done ? <><RotateCcw size={12} /> {t("cropCalendar.undo")}</> : <><CheckCircle2 size={13} /> {t("cropCalendar.markDone")}</>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CropCalendar({ cropName, isCultivating, sowingDate, plannedDate }) {
  const { t, i18n } = useTranslation();
  const weekdays = Array.from({ length: 7 }, (_, index) => new Date(2023, 0, 2 + index).toLocaleDateString(i18n.resolvedLanguage || "en-IN", { weekday: "short" }));
  const model = useMemo(() => buildCropCalendar({ cropName, isCultivating, sowingDate, plannedDate }), [cropName, isCultivating, sowingDate, plannedDate]);
  const storageKey = `${STORAGE_PREFIX}:${cropName || "crop"}:${sowingDate || plannedDate || "no-date"}`;
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  });
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const nextEvent = model.events.find((event) => event.date >= calendarDateKey(today) && !completed[event.id]) || model.events.find((event) => !completed[event.id]);
  const initialDate = nextEvent ? parseCalendarDate(nextEvent.date) : model.startDate || today;
  const [selectedDate, setSelectedDate] = useState(() => initialDate);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [view, setView] = useState("month");

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(completed)); } catch { /* Calendar still works for this session. */ }
  }, [completed, storageKey]);

  const eventByDate = useMemo(() => model.events.reduce((groups, event) => {
    (groups[event.date] ||= []).push(event);
    return groups;
  }, {}), [model.events]);
  const selectedKey = selectedDate ? calendarDateKey(selectedDate) : "";
  const selectedEvents = eventByDate[selectedKey] || [];
  const remainingEvents = model.events.filter((event) => !completed[event.id]);
  const completedCount = model.events.length - remainingEvents.length;
  const percent = model.events.length ? Math.round(completedCount / model.events.length * 100) : 0;
  const elapsed = model.startDate ? Math.max(0, Math.floor((today - model.startDate) / 86400000)) : 0;
  const phaseText = model.perennial
    ? (isCultivating ? t("cropCalendar.matureTrees") : t("cropCalendar.youngOrchard"))
      : isCultivating
      ? t("cropCalendar.stageDay", { stage: model.currentStage, day: elapsed + 1, duration: model.durationDays })
      : t("cropCalendar.plantingPlanned", { date: prettyDate(model.startDate, undefined, i18n.resolvedLanguage) });

  const toggleDone = (id) => setCompleted((previous) => {
    const next = { ...previous };
    if (next[id]) delete next[id]; else next[id] = true;
    return next;
  });

  const gridDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(start.getDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  if (!model.events.length) {
    return <section className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center dark:border-stone-700 dark:bg-stone-900">
      <CalendarDays className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
      <p className="text-sm font-bold">{t("cropCalendar.addCrop")}</p>
      <p className="mt-1 text-xs text-stone-500">{t("cropCalendar.useSavedPlan")}</p>
    </section>;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
      <header className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><CalendarDays size={19} /></span>
          <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-extrabold capitalize sm:text-lg">{t("cropCalendar.title", { crop: cropName })}</h3><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{model.perennial ? t("cropCalendar.orchardCare") : isCultivating ? t("cropCalendar.growingNow") : t("farmerDashboard.plannedSeason")}</span></div><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{phaseText}</p></div>
        </div>
        <div className="inline-flex w-fit rounded-xl bg-stone-100 p-1 dark:bg-stone-800" role="tablist" aria-label={t("cropCalendar.viewLabel")}>
          {["month", "timeline"].map((item) => <button key={item} role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${view === item ? "bg-white text-emerald-900 shadow-sm dark:bg-stone-700 dark:text-emerald-200" : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white"}`}>{item === "month" ? t("cropCalendar.month") : t("cropCalendar.allTasks")}</button>)}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(270px,0.8fr)]">
        {view === "month" ? (
          <div className="rounded-2xl border border-stone-200 p-3 dark:border-stone-800 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div><h4 className="text-sm font-bold">{monthLabel(visibleMonth, i18n.resolvedLanguage)}</h4><p className="text-[10px] text-stone-500">{t("cropCalendar.tasksThisMonth", { count: model.events.filter((event) => sameMonth(parseCalendarDate(event.date), visibleMonth)).length })}</p></div>
              <div className="flex items-center gap-1"><button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, -1))} className="grid h-8 w-8 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={t("cropCalendar.previousMonth")}><ChevronLeft size={17} /></button><button type="button" onClick={() => { setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }} className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">{t("farmerDashboard.today")}</button><button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, 1))} className="grid h-8 w-8 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={t("cropCalendar.nextMonth")}><ChevronRight size={17} /></button></div>
            </div>
            <div className="grid grid-cols-7 border-b border-stone-100 pb-2 text-center dark:border-stone-800">{weekdays.map((day) => <span key={day} className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{day}</span>)}</div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {gridDays.map((date) => {
                const key = calendarDateKey(date);
                const tasks = eventByDate[key] || [];
                const inMonth = sameMonth(date, visibleMonth);
                const isSelected = key === selectedKey;
                const isToday = key === calendarDateKey(today);
                const doneForDay = tasks.length > 0 && tasks.every((task) => completed[task.id]);
                return <button type="button" key={key} onClick={() => setSelectedDate(date)} aria-label={`${prettyDate(date)}${tasks.length ? `, ${tasks.length} field actions` : ""}`} aria-pressed={isSelected} className={`relative flex min-h-11 flex-col items-center justify-center rounded-xl text-xs transition sm:min-h-14 ${isSelected ? "bg-emerald-800 text-white" : isToday ? "bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200" : inMonth ? "text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800" : "text-stone-300 dark:text-stone-700"}`}>
                  <span>{date.getDate()}</span><span className="mt-1 flex h-1.5 gap-0.5">{tasks.slice(0, 3).map((task) => <i key={task.id} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-emerald-100" : doneForDay ? "bg-emerald-600" : task.kind === "stage" ? "bg-amber-500" : "bg-sky-500"}`} />)}</span>
                </button>;
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-3 text-[10px] text-stone-500 dark:border-stone-800 dark:text-stone-400"><span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t("cropCalendar.growthStage")}</span><span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-sky-500" />{t("cropCalendar.fieldCheck")}</span><span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-emerald-600" />{t("cropCalendar.done")}</span></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 p-4 text-stone-900 dark:border-stone-800 dark:text-stone-100">
            <div className="mb-4 flex items-center justify-between"><div><h4 className="text-sm font-bold">{t("cropCalendar.cropTasks")}</h4><p className="text-[11px] text-stone-500 dark:text-stone-400">{t("cropCalendar.tasksDone", { done: completedCount, total: model.events.length })}</p></div><span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{percent}%</span></div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full bg-emerald-700" /></div>
            <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">{model.events.map((event) => <TaskItem key={event.id} event={event} status={completed[event.id] ? "done" : event.date < calendarDateKey(today) ? "past" : event.date === calendarDateKey(today) ? "today" : "upcoming"} onToggle={toggleDone} compact />)}</div>
          </div>
        )}

        <aside className="rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">{t("cropCalendar.tasksForDay")}</p><h4 className="mt-1 text-sm font-bold text-stone-900 dark:text-stone-100">{selectedDate ? prettyDate(selectedDate, { weekday: "long", day: "numeric", month: "long" }, i18n.resolvedLanguage) : t("cropCalendar.chooseDate")}</h4></div>{selectedEvents.length > 0 && <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">{t("cropCalendar.taskCount", { count: selectedEvents.length })}</span>}</div>
          <div className="mt-4 space-y-2">
            {selectedEvents.length ? selectedEvents.map((event) => <TaskItem key={event.id} event={event} status={completed[event.id] ? "done" : event.date < calendarDateKey(today) ? "past" : event.date === calendarDateKey(today) ? "today" : "upcoming"} onToggle={toggleDone} />) : <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 px-3 py-5 text-center dark:border-stone-700 dark:bg-stone-900/50"><Clock3 size={17} className="mx-auto text-stone-400" /><p className="mt-2 text-xs font-semibold text-stone-700 dark:text-stone-200">{t("cropCalendar.noTask")}</p><p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{t("cropCalendar.chooseDayHint")}</p></div>}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200/80 bg-white p-3 text-[11px] leading-relaxed text-stone-600 dark:border-emerald-900/60 dark:bg-stone-900 dark:text-stone-300"><div className="mb-1 flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200"><Leaf size={13} />Calendar guidance</div>{model.note}</div>
        </aside>
      </div>

      {view === "month" && nextEvent && <button type="button" onClick={() => { const date = parseCalendarDate(nextEvent.date); setSelectedDate(date); setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }} className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-300"><ArrowLeft size={13} /> Jump to next planned action: {prettyDate(nextEvent.date)} · {nextEvent.title} <ArrowRight size={13} /></button>}
      <p className="text-[10px] text-stone-500 dark:text-stone-400">{t("cropCalendar.localSaveNote")}</p>
    </section>
  );
}
