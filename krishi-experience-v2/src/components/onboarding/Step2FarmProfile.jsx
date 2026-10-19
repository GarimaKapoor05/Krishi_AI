import React from "react";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Droplets,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  INDIAN_STATES,
  SOIL_TYPES,
  IRRIGATION_SOURCES,
  WATER_AVAILABILITY,
  FARMING_SEASONS
} from "../../data/constants";

export function Step2FarmProfile({
  farmLocation,
  onChange,
  onNext,
  onPrev,
  errors = {}
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-primary p-6 sm:p-8 text-white">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-brand-mint text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>Step 2 of 4 &bull; Farm Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight mb-2">
          Tell Us About Your Farm Land
        </h1>
        <p className="text-brand-mint/90 text-sm sm:text-base leading-relaxed max-w-2xl">
          Agricultural recommendations vary dramatically by geography, rainfall, and soil characteristics. Non-mandatory fields can be skipped if you don't have them handy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Section 1: Geographic Location */}
        <div>
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-brand-border">
            <MapPin className="w-5 h-5 text-brand-green" />
            <h2 className="text-base font-bold text-stone-800">
              1. Farm Geography &amp; Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Village / Town */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Village or Town <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={farmLocation.village}
                onChange={(e) => onChange({ village: e.target.value })}
                placeholder="e.g. Rampur or Khanna"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.village
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              {errors.village && (
                <p className="text-xs text-red-600 mt-1">{errors.village}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={farmLocation.state}
                onChange={(e) => onChange({ state: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white ${
                  errors.state
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-600 mt-1">{errors.state}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={farmLocation.district}
                onChange={(e) => onChange({ district: e.target.value })}
                placeholder="e.g. Ludhiana or Nashik"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.district
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              {errors.district && (
                <p className="text-xs text-red-600 mt-1">{errors.district}</p>
              )}
            </div>

            {/* PIN Code */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                PIN Code <span className="text-xs text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={farmLocation.pincode}
                onChange={(e) => onChange({ pincode: e.target.value.replace(/\D/g, "") })}
                placeholder="6-digit PIN code (e.g. 141401)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.pincode
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              {errors.pincode && (
                <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Farm Land Size & Measurement Unit */}
        <div>
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-brand-border">
            <Layers className="w-5 h-5 text-brand-green" />
            <h2 className="text-base font-bold text-stone-800">
              2. Total Cultivable Land
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Farm Size <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={farmLocation.farmSize}
                onChange={(e) => onChange({ farmSize: e.target.value })}
                placeholder="e.g. 5.0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.farmSize
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-brand-border focus:border-brand-green focus:ring-2 focus:ring-brand-mint/50"
                }`}
              />
              {errors.farmSize && (
                <p className="text-xs text-red-600 mt-1">{errors.farmSize}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Measurement Unit
              </label>
              <div className="grid grid-cols-2 gap-2 h-[42px]">
                <button
                  type="button"
                  onClick={() => onChange({ measurementUnit: "acres" })}
                  className={`rounded-xl text-sm font-semibold border transition-all ${
                    farmLocation.measurementUnit === "acres"
                      ? "bg-brand-green text-white border-brand-green shadow-sm"
                      : "bg-brand-surface text-stone-700 border-brand-border hover:bg-stone-50"
                  }`}
                >
                  Acres (एकड़)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ measurementUnit: "hectares" })}
                  className={`rounded-xl text-sm font-semibold border transition-all ${
                    farmLocation.measurementUnit === "hectares"
                      ? "bg-brand-green text-white border-brand-green shadow-sm"
                      : "bg-brand-surface text-stone-700 border-brand-border hover:bg-stone-50"
                  }`}
                >
                  Hectares (हेक्टेयर)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Soil Type Selection */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-green" />
              <h2 className="text-base font-bold text-stone-800">
                3. Soil Type
              </h2>
            </div>
            <span className="text-xs text-stone-400">Select the best match</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOIL_TYPES.map((soil) => {
              const isSelected = farmLocation.soilType === soil.id;
              const isUnknown = soil.id === "unknown";

              return (
                <div
                  key={soil.id}
                  onClick={() => onChange({ soilType: soil.id })}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "border-brand-green bg-brand-mint/20 shadow-sm"
                      : "border-brand-border bg-white hover:border-stone-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: soil.color }}
                        />
                        <span className="font-bold text-sm text-stone-800">
                          {soil.name}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {soil.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Irrigation Source & Water Availability */}
        <div>
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-brand-border">
            <Droplets className="w-5 h-5 text-brand-green" />
            <h2 className="text-base font-bold text-stone-800">
              4. Irrigation Source &amp; Water Availability
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Irrigation Source */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Primary Irrigation Source
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {IRRIGATION_SOURCES.map((src) => {
                  const isSelected = farmLocation.irrigationSource === src.id;
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => onChange({ irrigationSource: src.id })}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-brand-green text-white border-brand-green shadow-sm"
                          : "bg-white text-stone-700 border-brand-border hover:bg-stone-50"
                      }`}
                    >
                      <span>{src.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Water Availability Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Water Availability
              </label>
              <div className="space-y-2">
                {WATER_AVAILABILITY.map((w) => {
                  const isSelected = farmLocation.waterAvailability === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => onChange({ waterAvailability: w.id })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-brand-green bg-brand-mint/20 shadow-sm"
                          : "border-brand-border bg-white hover:border-stone-400"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-stone-800 block">
                          {w.label}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {w.description}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Preferred Season */}
        <div>
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-brand-border">
            <Calendar className="w-5 h-5 text-brand-green" />
            <h2 className="text-base font-bold text-stone-800">
              5. Preferred Farming Season
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FARMING_SEASONS.map((season) => {
              const isSelected = farmLocation.preferredSeason === season.id;
              return (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => onChange({ preferredSeason: season.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-brand-green bg-brand-mint/30 shadow-sm"
                      : "border-brand-border bg-white hover:border-stone-400"
                  }`}
                >
                  <span className="text-xs font-bold text-stone-800 block mb-0.5">
                    {season.label}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                    {season.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onPrev}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Continue to Farming Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
