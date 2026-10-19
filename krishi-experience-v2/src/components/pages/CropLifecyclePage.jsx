import React, { useState, useMemo } from "react";
import {
  Sprout,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Layers,
  ArrowLeft,
  SlidersHorizontal,
  Edit3,
  CalendarCheck2,
  Bookmark,
  Droplets,
  FlaskConical,
  Bug,
  Sparkles
} from "lucide-react";
import { formatDateISO } from "../../services/cropLifecycleEngine";

export function CropLifecyclePage({
  lifecycleState,
  onToggleTask,
  onRescheduleTask,
  onUpdateNote,
  onOpenCropSelector,
  onBackToDashboard
}) {
  const todayISO = formatDateISO(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [rescheduleModalTask, setRescheduleModalTask] = useState(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [editingNoteTaskId, setEditingNoteTaskId] = useState(null);

  if (!lifecycleState) return null;

  const {
    cropName,
    standardVariety,
    sowingDate,
    das,
    totalDurationDays,
    stages,
    currentStage,
    stageProgress,
    overallProgress,
    harvestWindow,
    tasks = []
  } = lifecycleState;

  // Group tasks by scheduled date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!map[t.scheduledDate]) {
        map[t.scheduledDate] = [];
      }
      map[t.scheduledDate].push(t);
    });
    return map;
  }, [tasks]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    const dayTasks = tasksByDate[selectedDate] || [];
    if (categoryFilter === "all") return dayTasks;
    return dayTasks.filter((t) => t.category === categoryFilter);
  }, [tasksByDate, selectedDate, categoryFilter]);

  // Calendar calculations for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Preceding month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const iso = formatDateISO(d);
      days.push({
        date: d,
        iso,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        tasks: tasksByDate[iso] || []
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = formatDateISO(d);
      days.push({
        date: d,
        iso,
        dayNum: i,
        isCurrentMonth: true,
        tasks: tasksByDate[iso] || []
      });
    }

    // Trailing next month days to complete 35 or 42 grid cells
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const iso = formatDateISO(d);
        days.push({
          date: d,
          iso,
          dayNum: i,
          isCurrentMonth: false,
          tasks: tasksByDate[iso] || []
        });
      }
    }

    return days;
  }, [currentMonthDate, tasksByDate]);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentMonthDate(new Date());
    setSelectedDate(todayISO);
  };

  // Reschedule handler
  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (rescheduleModalTask && newDateInput) {
      onRescheduleTask(rescheduleModalTask.id, newDateInput, noteInput);
      setRescheduleModalTask(null);
      setNewDateInput("");
      setNoteInput("");
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "irrigation": return "bg-blue-500";
      case "nutrient": return "bg-emerald-600";
      case "protection": return "bg-amber-500";
      case "weeding": return "bg-purple-500";
      case "harvest": return "bg-amber-700";
      default: return "bg-teal-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-brand-border gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-sand transition-colors text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
                Crop Life-Cycle &amp; Calendar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-mint text-brand-green border border-brand-leaf/30">
                Day {das}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Field management schedule for <strong>{cropName}</strong> &bull; Sown on {sowingDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCropSelector}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white border border-brand-border text-stone-700 hover:bg-stone-50 flex items-center space-x-2 shadow-xs shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-green" />
          <span>Edit Crop / Sowing Date</span>
        </button>
      </div>

      {/* 1. HORIZONTAL CROP GROWTH TIMELINE / GANTT-STYLE CHART */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-brand-border gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-sans flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-brand-green" />
              <span>Agronomic Growth Stage Timeline (Gantt View)</span>
            </h2>
            <p className="text-xs text-stone-500">
              Total Duration: ~{totalDurationDays} Days &bull; Sowing Date: {sowingDate}
            </p>
          </div>

          <div className="text-xs text-stone-600 bg-brand-sand px-3 py-1.5 rounded-xl border border-brand-border">
            Estimated Harvest: <strong>{harvestWindow?.start}</strong> to <strong>{harvestWindow?.end}</strong>
          </div>
        </div>

        {/* Multi-Stage Visual Gantt Strip */}
        <div className="space-y-4">
          <div className="w-full bg-stone-100 rounded-2xl p-3 border border-brand-border overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Progress Bar with Markers */}
              <div className="h-5 bg-stone-200 rounded-full overflow-hidden flex relative shadow-inner">
                {stages.map((st) => {
                  const span = st.endDay - st.startDay;
                  const pctWidth = (span / totalDurationDays) * 100;
                  return (
                    <div
                      key={st.id}
                      className={`h-full border-r border-white/60 transition-all ${
                        st.isCompleted
                          ? "bg-brand-green"
                          : st.isCurrent
                          ? "bg-brand-leaf animate-pulse"
                          : "bg-stone-300"
                      }`}
                      style={{ width: `${pctWidth}%` }}
                      title={`${st.name} (Days ${st.startDay} - ${st.endDay})`}
                    />
                  );
                })}

                {/* Today Marker Pin */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-red-500 z-10 -translate-x-1/2"
                  style={{ left: `${Math.min(100, (das / totalDurationDays) * 100)}%` }}
                  title={`Today: Day ${das}`}
                >
                  <div className="w-3 h-3 rounded-full bg-red-600 -translate-x-1 -translate-y-1 shadow-sm" />
                </div>
              </div>

              {/* Stage Labels Row */}
              <div className="flex text-[11px] font-semibold text-stone-600 mt-3">
                {stages.map((st) => {
                  const span = st.endDay - st.startDay;
                  const pctWidth = (span / totalDurationDays) * 100;
                  return (
                    <div
                      key={st.id}
                      className="truncate px-1 text-center"
                      style={{ width: `${pctWidth}%` }}
                    >
                      <span className={`block truncate ${st.isCurrent ? "text-brand-green font-bold" : ""}`}>
                        {st.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        D{st.startDay}–{st.endDay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Stage Deep Dive */}
          <div className="p-4 rounded-xl bg-brand-mint/20 border border-brand-leaf/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-brand-green text-sm block">
                Active Phase: {currentStage?.name} (Day {das})
              </span>
              <p className="text-stone-600 mt-0.5 leading-relaxed">
                {currentStage?.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-stone-500 text-[11px] block">Stage Progress</span>
              <span className="text-base font-extrabold text-brand-green">
                {stageProgress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE MONTHLY CALENDAR & DAILY TASK DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Monthly Calendar Grid (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-brand-green" />
              <h3 className="font-bold text-base text-stone-900 font-sans">
                {currentMonthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </h3>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={goToToday}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-sand hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-brand-border hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-brand-border hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              const isSelected = selectedDate === cell.iso;
              const isToday = todayISO === cell.iso;
              const hasTasks = cell.tasks.length > 0;
              const hasCompleted = cell.tasks.some((t) => t.status === "completed");
              const hasPending = cell.tasks.some((t) => t.status !== "completed");

              return (
                <div
                  key={cell.iso}
                  onClick={() => setSelectedDate(cell.iso)}
                  className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-brand-green bg-brand-mint/30 ring-2 ring-brand-green/30 shadow-xs"
                      : isToday
                      ? "border-brand-leaf/60 bg-amber-50/50"
                      : cell.isCurrentMonth
                      ? "border-brand-border bg-white hover:border-stone-400"
                      : "border-stone-100 bg-stone-50/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "w-5 h-5 rounded-full bg-brand-green text-white flex items-center justify-center text-[10px]"
                          : cell.isCurrentMonth
                          ? "text-stone-800"
                          : "text-stone-400"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasTasks && (
                      <span className="text-[10px] font-bold text-stone-500">
                        {cell.tasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Indicator Dots */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cell.tasks.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        title={t.title}
                        className={`w-2 h-2 rounded-full ${
                          t.status === "completed"
                            ? "bg-brand-green ring-1 ring-brand-mint"
                            : getCategoryColor(t.category)
                        }`}
                      />
                    ))}
                    {cell.tasks.length > 3 && (
                      <span className="text-[9px] text-stone-400 font-bold leading-none">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Category Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-brand-border text-[11px] text-stone-600">
            <span className="font-semibold text-stone-400">Legend:</span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Irrigation</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Nutrients</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Protection</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Weeding</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Right Column: Daily Task Details Panel (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 flex flex-col justify-between">
          <div>
            {/* Header with Selected Date */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                  {selectedDate === todayISO ? "Today's Schedule" : "Selected Date"}
                </span>
                <h3 className="font-bold text-base text-stone-900 font-sans">
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-sand text-stone-700">
                {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {/* Task Category Filter */}
            <div className="flex items-center space-x-1.5 mb-4 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "all" ? "bg-brand-green text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("irrigation")}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "irrigation" ? "bg-blue-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Irrigation
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("nutrient")}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "nutrient" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Nutrient
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("protection")}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "protection" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Protection
              </button>
            </div>

            {/* Task Items List */}
            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400 bg-brand-sand/40 rounded-xl border border-dashed border-stone-200 p-6">
                <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-stone-600">No activities scheduled on this day</p>
                <p className="mt-1 text-[11px]">Select another calendar date with activity dots to view tasks.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {selectedDateTasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? "bg-stone-50 border-stone-200 opacity-80"
                          : "bg-white border-brand-border shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id, !isDone)}
                            className="mt-0.5 text-stone-400 hover:text-brand-green transition-colors"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-brand-green fill-brand-mint" />
                            ) : (
                              <Circle className="w-5 h-5 text-stone-300 hover:text-brand-green" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-xs font-bold ${isDone ? "line-through text-stone-400" : "text-stone-900"}`}>
                                {task.title}
                              </h4>
                              {task.isCritical && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                  Critical
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 font-semibold capitalize block mt-0.5">
                              {task.category} &bull; {task.stageName}
                            </span>
                          </div>
                        </div>

                        {/* Reschedule Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleModalTask(task);
                            setNewDateInput(task.scheduledDate);
                          }}
                          className="text-[11px] font-semibold text-stone-500 hover:text-brand-green underline"
                        >
                          Reschedule
                        </button>
                      </div>

                      {/* Description & Agronomic Reason */}
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="mt-2.5 p-2 rounded-lg bg-brand-sand/60 text-[11px] text-stone-700">
                        <strong className="text-stone-900 font-semibold">Agronomic Reason: </strong>
                        {task.reason}
                      </div>

                      {/* Notes Section */}
                      <div className="mt-2.5 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                        {editingNoteTaskId === task.id ? (
                          <div className="w-full flex items-center space-x-2 mt-1">
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="e.g. Applied 40kg Urea via tractor sprayer"
                              className="w-full px-2 py-1 text-xs rounded border border-stone-300 outline-none focus:border-brand-green"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateNote(task.id, noteInput);
                                setEditingNoteTaskId(null);
                              }}
                              className="px-2 py-1 bg-brand-green text-white font-bold rounded text-xs"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-stone-500 italic">
                              {task.notes ? `Note: ${task.notes}` : "No farmer notes added"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteTaskId(task.id);
                                setNoteInput(task.notes || "");
                              }}
                              className="text-stone-400 hover:text-stone-800 flex items-center space-x-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{task.notes ? "Edit Note" : "Add Note"}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border text-center text-xs text-stone-400">
            All updates sync immediately with the dashboard and mobile advisory feeds.
          </div>
        </div>
      </div>

      {/* Reschedule Task Modal */}
      {rescheduleModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-elevated w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Reschedule Activity
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {rescheduleModalTask.title}
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  New Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Reason for Rescheduling <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Delayed due to heavy rain / labor shortage"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-green text-white hover:bg-brand-primary shadow-xs"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
