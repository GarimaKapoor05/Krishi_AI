import React from "react";
import {
  Sprout,
  MapPin,
  Calendar,
  Layers,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from "lucide-react";

export function DashboardHeader({
  profile,
  lifecycleState,
  onOpenCropSelector,
  onNavigate
}) {
  const farmerName = profile?.account?.firstName
    ? `${profile.account.firstName} ${profile.account.lastName || ""}`.trim()
    : "Farmer";

  const locationText = [
    profile?.farmLocation?.village,
    profile?.farmLocation?.district,
    profile?.farmLocation?.state
  ].filter(Boolean).join(", ") || "India";

  const farmSizeText = profile?.farmLocation?.farmSize
    ? `${profile.farmLocation.farmSize} ${profile.farmLocation.measurementUnit || "Acres"}`
    : "Registered Farm";

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 sm:p-8 mb-8 relative overflow-hidden">
      {/* Decorative subtle agricultural accent */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-brand-mint/30 to-transparent pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Farmer & Farm Identity */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-leaf uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Farm Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-sans">
            Namaste, {farmerName}
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500 mt-2">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-brand-green" />
              <span>{locationText}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-brand-earth" />
              <span>{farmSizeText}</span>
            </span>
            <span>&bull;</span>
            <span className="capitalize">{profile?.farmLocation?.soilType || "Alluvial"} Soil</span>
          </div>
        </div>

        {/* Active Crop Stage Badge & Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Crop Indicator */}
          <div className="p-3 rounded-xl bg-brand-sand border border-brand-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-brand-green text-brand-mint flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">
                  {lifecycleState?.cropName || "Active Crop"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-mint text-brand-green border border-brand-leaf/30">
                  Day {lifecycleState?.das || 0}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {lifecycleState?.currentStage?.name || "Vegetative Stage"}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCropSelector}
              title="Change active crop or adjust sowing date"
              className="p-1.5 text-stone-400 hover:text-brand-green rounded-lg hover:bg-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Life Cycle Quick Link */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("lifecycle")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-sm flex items-center space-x-1.5"
          >
            <span>Crop Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
