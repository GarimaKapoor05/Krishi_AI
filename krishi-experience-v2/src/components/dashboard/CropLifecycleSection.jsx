import React, { useState } from "react";
import {
  Sprout,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Layers,
  ChevronRight
} from "lucide-react";

export function CropLifecycleSection({
  lifecycleState,
  onToggleTask,
  onNavigate
}) {
  const [filter, setFilter] = useState("all"); // 'all' | 'due' | 'completed'

  if (!lifecycleState) return null;

  const {
    cropName,
    standardVariety,
    sowingDate,
    das,
    totalDurationDays,
    currentStage,
    stageProgress,
    overallProgress,
    stages,
    harvestWindow,
    tasks = []
  } = lifecycleState;

  // Filter tasks: due soon, today, completed
  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "due") return t.status === "pending" || t.status === "overdue";
    return true;
  }).slice(0, 5); // show top 5 on dashboard

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-brand-border gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-mint text-brand-green">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-stone-900 font-sans">
                Crop Life-Cycle &amp; Daily Advisory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-green text-white">
                Day {das} of ~{totalDurationDays}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {cropName} ({standardVariety}) &bull; Sown on {sowingDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate("lifecycle")}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-brand-sand hover:bg-stone-200 text-stone-800 transition-colors"
        >
          <span>Open Full Interactive Calendar</span>
          <ChevronRight className="w-3.5 h-3.5 text-brand-green" />
        </button>
      </div>

      {/* Stage Visual Progress Bar */}
      <div className="mb-6 p-4 rounded-xl bg-brand-sand/50 border border-brand-border">
        <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
          <span>Current Stage: <strong className="text-brand-green">{currentStage?.name}</strong></span>
          <span>{overallProgress}% Total Duration</span>
        </div>

        {/* Multi-segment growth bar */}
        <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden flex">
          {stages.map((st, i) => {
            const span = st.endDay - st.startDay;
            const pctWidth = (span / totalDurationDays) * 100;
            return (
              <div
                key={st.id}
                title={`${st.name} (Day ${st.startDay} - ${st.endDay})`}
                className={`h-full border-r border-white/50 transition-all ${
                  st.isCompleted
                    ? "bg-brand-green"
                    : st.isCurrent
                    ? "bg-brand-leaf animate-pulse"
                    : "bg-stone-300"
                }`}
                style={{ width: `${pctWidth}%` }}
              />
            );
          })}
        </div>

        {/* Stage Timeline Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 mt-2 gap-1">
          <p className="line-clamp-1">{currentStage?.description}</p>
          <span className="shrink-0 font-medium text-stone-700">
            Est. Harvest Window: <strong>{harvestWindow?.start}</strong> to <strong>{harvestWindow?.end}</strong>
          </span>
        </div>
      </div>

      {/* Today's Tasks & Urgent Agronomic Activities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-stone-900">
              Field Action Checklist
            </h3>
            <span className="text-xs text-stone-400">
              ({completedCount} done, {pendingCount} pending)
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === "all" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("due")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === "due" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              Due
            </button>
            <button
              type="button"
              onClick={() => setFilter("completed")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === "completed" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isOverdue = task.status === "overdue";

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? "bg-stone-50/80 border-stone-200 opacity-75"
                    : isOverdue
                    ? "bg-red-50/50 border-red-200"
                    : "bg-white border-brand-border hover:border-stone-400 shadow-xs"
                }`}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id, !isCompleted)}
                    className="mt-0.5 shrink-0 text-stone-400 hover:text-brand-green transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-green fill-brand-mint" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 hover:text-brand-green" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h4
                        className={`font-bold text-xs sm:text-sm ${
                          isCompleted ? "line-through text-stone-400" : "text-stone-900"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.isCritical && !isCompleted && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          Critical
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400 font-medium capitalize">
                        &bull; {task.category}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-stone-400 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>Scheduled: {task.scheduledDate}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-stone-500 font-medium">
                        {task.reason}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
          <span className="text-stone-400">
            Showing next 5 agronomic tasks. Full crop schedule available in calendar.
          </span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("lifecycle")}
            className="font-bold text-brand-green hover:underline hover:text-brand-emerald flex items-center space-x-1"
          >
            <span>View Month Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
