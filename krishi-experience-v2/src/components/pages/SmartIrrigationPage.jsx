import React, { useState } from "react";
import {
  Droplets,
  ArrowLeft,
  Clock,
  Compass,
  Layers,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";

export function SmartIrrigationPage({ farmLocation, onBackToDashboard }) {
  const [soilMoisture, setSoilMoisture] = useState(38);
  const [irrigationSource, setIrrigationSource] = useState(
    farmLocation?.irrigationSource || "borewell"
  );

  const waterNeededMm = Math.max(0, Math.round((60 - soilMoisture) * 1.5));
  const dripDurationMinutes = Math.round(waterNeededMm * 4.2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 mb-6 border-b border-brand-border">
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
              Smart Irrigation &amp; Water Advisor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
              Micro-Irrigation
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Optimize root-zone water delivery and conserve electricity
          </p>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-6 space-y-6">
        {/* Interactive Soil Moisture Slider */}
        <div className="p-4 rounded-xl bg-brand-sand/60 border border-brand-border">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
            <span>Estimated Soil Moisture Level</span>
            <span className="text-base text-blue-600 font-extrabold">{soilMoisture}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={soilMoisture}
            onChange={(e) => setSoilMoisture(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
            <span>Critical Dry (10%)</span>
            <span>Optimal Range (45-60%)</span>
            <span>Saturated (80%)</span>
          </div>
        </div>

        {/* Irrigation Recommendation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-brand-border bg-white text-center">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Urgency Status
            </span>
            <span className={`text-lg font-bold block my-1 ${soilMoisture < 40 ? "text-amber-600" : "text-emerald-700"}`}>
              {soilMoisture < 40 ? "Irrigate Now" : "Sufficient Moisture"}
            </span>
            <span className="text-[10px] text-stone-400">
              {soilMoisture < 40 ? "Moisture below depletion threshold" : "No water stress observed"}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-white text-center">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Net Water Deficit
            </span>
            <span className="text-lg font-bold text-stone-900 block my-1">
              {waterNeededMm} mm
            </span>
            <span className="text-[10px] text-stone-400">
              Depth to restore field capacity
            </span>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-white text-center">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Drip Running Duration
            </span>
            <span className="text-lg font-bold text-blue-600 block my-1">
              {dripDurationMinutes} Minutes
            </span>
            <span className="text-[10px] text-stone-400">
              Recommended in early morning hours
            </span>
          </div>
        </div>

        {/* Practical Agronomic Tips */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-blue-950">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Water Conservation Guidelines</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
            <li>Irrigate between 5:30 AM and 8:30 AM to minimize evaporation loss during peak sun.</li>
            <li>Apply crop residue mulching along furrows to reduce soil surface evaporation by up to 30%.</li>
            <li>Flush drip lateral filters weekly to prevent emitter clogging from silt particles.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
