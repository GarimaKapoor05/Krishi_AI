import React, { useState } from "react";
import {
  Sprout,
  Compass,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Camera,
  Info,
  Layers,
  Sparkles,
  Droplets,
  AlertTriangle
} from "lucide-react";
import {
  POPULAR_CROPS,
  CROP_STAGES,
  COMMON_FERTILIZERS,
  IRRIGATION_FREQUENCIES,
  FARMING_SEASONS,
  WATER_AVAILABILITY
} from "../../data/onboardingConstants";
import { CropRecommendationPanel } from "./CropRecommendationPanel";

export function Step3FarmingStatus({
  farmingStatus,
  activeFarming,
  planningFarming,
  farmLocation,
  onStatusChange,
  onActiveChange,
  onPlanningChange,
  onNext,
  onPrev,
  errors = {}
}) {
  const [photoPreview, setPhotoPreview] = useState(
    planningFarming.soilPhoto?.previewUrl || null
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Toggle fertilizer selection
  const toggleFertilizer = (fert) => {
    const current = activeFarming.fertilizersUsed || [];
    if (current.includes(fert)) {
      onActiveChange({
        fertilizersUsed: current.filter((f) => f !== fert)
      });
    } else {
      onActiveChange({
        fertilizersUsed: [...current, fert]
      });
    }
  };

  // Toggle interested crops in planning
  const toggleInterestedCrop = (crop) => {
    const current = planningFarming.interestedCrops || [];
    if (current.includes(crop)) {
      onPlanningChange({
        interestedCrops: current.filter((c) => c !== crop)
      });
    } else {
      onPlanningChange({
        interestedCrops: [...current, crop]
      });
    }
  };

  // Handle optional soil photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Please upload an image smaller than 5 MB");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      onPlanningChange({
        soilPhoto: {
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl
        }
      });
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    onPlanningChange({ soilPhoto: null });
  };

  const updateSoilNutrient = (key, value) => {
    onPlanningChange({
      soilNutrients: { ...planningFarming.soilNutrients, [key]: value },
      cropRecommendation: null,
    });
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-primary p-6 sm:p-8 text-white">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-brand-mint text-xs font-semibold mb-3">
          <Sprout className="w-3.5 h-3.5" />
          <span>Step 3 of 4 &bull; Farming Status</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight mb-2">
          What is Your Current Crop Status?
        </h1>
        <p className="text-brand-mint/90 text-sm sm:text-base leading-relaxed max-w-2xl">
          Tell us whether you have started a crop or are planning one. These details will prepare your profile for future recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Branch Selection Cards */}
        <div>
          <label className="block text-sm font-bold text-stone-800 mb-3">
            Have you already started growing a crop? <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Yes, I'm already farming */}
            <div
              onClick={() => onStatusChange("active")}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                farmingStatus === "active"
                  ? "border-brand-green bg-brand-mint/30 shadow-card ring-2 ring-brand-green/20"
                  : "border-brand-border bg-white hover:border-stone-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-green text-brand-mint flex items-center justify-center shadow-sm">
                    <Sprout className="w-6 h-6" />
                  </div>
                  {farmingStatus === "active" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-green text-white flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  Option A — Yes, I'm already farming
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  I currently have crops standing in my field. I need stage-specific care, irrigation timing, and fertilizer dosage guidance.
                </p>
              </div>
            </div>

            {/* Option B: No, I'm planning to start */}
            <div
              onClick={() => onStatusChange("planning")}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                farmingStatus === "planning"
                  ? "border-brand-green bg-brand-mint/30 shadow-card ring-2 ring-brand-green/20"
                  : "border-brand-border bg-white hover:border-stone-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-earth text-white flex items-center justify-center shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  {farmingStatus === "planning" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-green text-white flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  Option B — No, I'm planning to start
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  I am planning a crop and want to share details for future crop guidance.
                </p>
              </div>
            </div>
          </div>

          {errors.status && (
            <p className="text-xs text-red-600 mt-2 font-semibold">{errors.status}</p>
          )}
        </div>

        {/* =========================================================================
            CONDITIONAL BRANCH A: ACTIVE FARMING
        ========================================================================= */}
        {farmingStatus === "active" && (
          <div className="p-6 rounded-2xl bg-brand-sand/60 border border-brand-border space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2 pb-3 border-b border-brand-border">
              <Sprout className="w-5 h-5 text-brand-green" />
              <h3 className="text-base font-bold text-stone-800">
                Active Crop Details
              </h3>
            </div>

            {/* Crop Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Current Crop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activeFarming.cropName}
                onChange={(e) => onActiveChange({ cropName: e.target.value })}
                placeholder="e.g. Wheat, Paddy, Cotton, Potato"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.cropName
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-brand-border bg-white focus:border-brand-green"
                }`}
              />
              {errors.cropName && (
                <p className="text-xs text-red-600 mt-1">{errors.cropName}</p>
              )}

              {/* Popular crop chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium text-stone-500 mr-1 py-1">
                  Quick select:
                </span>
                {POPULAR_CROPS.slice(0, 8).map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => onActiveChange({ cropName: crop })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      activeFarming.cropName === crop
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Sowing Date & Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Sowing or Planting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={activeFarming.sowingDate}
                  onChange={(e) => onActiveChange({ sowingDate: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white ${
                    errors.sowingDate
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-brand-border focus:border-brand-green"
                  }`}
                />
                {errors.sowingDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.sowingDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Current Crop Stage <span className="text-stone-400 font-normal lowercase">(if known)</span>
                </label>
                <select
                  value={activeFarming.cropStage}
                  onChange={(e) => onActiveChange({ cropStage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-sm transition-all outline-none bg-white focus:border-brand-green"
                >
                  <option value="">Select current stage</option>
                  {CROP_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Existing Fertilizers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Fertilizers Already Applied <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FERTILIZERS.map((fert) => {
                  const isChecked = activeFarming.fertilizersUsed?.includes(fert);
                  return (
                    <button
                      key={fert}
                      type="button"
                      onClick={() => toggleFertilizer(fert)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isChecked
                          ? "bg-brand-green text-white border-brand-green shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {fert}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Irrigation Frequency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Existing Irrigation Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {IRRIGATION_FREQUENCIES.map((freq) => {
                  const isSelected = activeFarming.irrigationFrequency === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => onActiveChange({ irrigationFrequency: freq })}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        isSelected
                          ? "bg-brand-green text-white border-brand-green"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {freq}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONDITIONAL BRANCH B: PLANNING TO START
        ========================================================================= */}
        {farmingStatus === "planning" && (
          <div className="p-6 rounded-2xl bg-brand-sand/60 border border-brand-border space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2 pb-3 border-b border-brand-border">
              <Compass className="w-5 h-5 text-brand-green" />
              <h3 className="text-base font-bold text-stone-800">
                Upcoming Season Planning
              </h3>
            </div>

            {/* Planned Sowing Period & Target Season */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Planned Sowing Period <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={planningFarming.plannedSowingPeriod}
                  onChange={(e) => onPlanningChange({ plannedSowingPeriod: e.target.value })}
                  placeholder="e.g. Next 2 weeks, Mid-June, or October"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                    errors.plannedSowingPeriod
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-brand-border bg-white focus:border-brand-green"
                  }`}
                />
                {errors.plannedSowingPeriod && (
                  <p className="text-xs text-red-600 mt-1">{errors.plannedSowingPeriod}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Target Farming Season <span className="text-red-500">*</span>
                </label>
                <select
                  value={planningFarming.farmingSeason}
                  onChange={(e) => onPlanningChange({ farmingSeason: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white ${
                    errors.farmingSeason
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-brand-border focus:border-brand-green"
                  }`}
                >
                  <option value="">Select Planned Season</option>
                  {FARMING_SEASONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errors.farmingSeason && (
                  <p className="text-xs text-red-600 mt-1">{errors.farmingSeason}</p>
                )}
              </div>
            </div>

            {/* Soil Test Values (if known) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Have you completed a laboratory soil health test?
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onPlanningChange({ soilTestDone: "yes" })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      planningFarming.soilTestDone === "yes"
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    Yes, I have values
                  </button>
                  <button
                    type="button"
                    onClick={() => onPlanningChange({ soilTestDone: "no" })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      planningFarming.soilTestDone === "no"
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    No / Not yet
                  </button>
                </div>
              </div>

              {planningFarming.soilTestDone === "yes" && (
                <div className="p-4 rounded-xl bg-white border border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Nitrogen (N) kg/ha
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={planningFarming.soilNutrients?.nitrogen || ""}
                      onChange={(e) =>
                        updateSoilNutrient("nitrogen", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Phosphorus (P) kg/ha
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={planningFarming.soilNutrients?.phosphorus || ""}
                      onChange={(e) =>
                        updateSoilNutrient("phosphorus", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Potassium (K) kg/ha
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={planningFarming.soilNutrients?.potassium || ""}
                      onChange={(e) =>
                        updateSoilNutrient("potassium", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Soil pH (0–14)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 6.8"
                      value={planningFarming.soilNutrients?.ph || ""}
                      onChange={(e) =>
                        updateSoilNutrient("ph", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
              )}
            </div>

            <CropRecommendationPanel
              farmLocation={farmLocation}
              soilNutrients={planningFarming.soilNutrients}
              soilTestDone={planningFarming.soilTestDone}
              onRecommendation={(cropRecommendation) => onPlanningChange({ cropRecommendation })}
              onSelectCrop={(primaryCrop) => onPlanningChange({ primaryCrop })}
            />

            {/* Crops farmer is interested in */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Crops You Are Considering <span className="text-stone-400 font-normal lowercase">(select multiple if interested)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CROPS.map((crop) => {
                  const isSelected = planningFarming.interestedCrops?.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleInterestedCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-brand-green text-white border-brand-green shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Soil Photograph Upload & Mandatory Scientific Disclaimer */}
            <div className="p-4 rounded-xl bg-white border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-brand-green" />
                  <span className="text-xs font-bold text-stone-800">
                    Optional Soil Photograph
                  </span>
                </div>
                <span className="text-[11px] font-medium text-stone-400">
                  Visual texture aid only
                </span>
              </div>

              {photoPreview ? (
                <div className="flex items-center space-x-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <img
                    src={photoPreview}
                    alt="Soil Sample"
                    className="w-16 h-16 object-cover rounded-lg border border-stone-300"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-stone-800">
                      {planningFarming.soilPhoto?.name || "Uploaded soil photo"}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Added for visual texture assessment
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <label className="border-2 border-dashed border-stone-300 hover:border-brand-green rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                    <Camera className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-xs font-bold text-stone-700">
                      Click to upload a soil photo (optional)
                    </span>
                    <span className="text-[11px] text-stone-400">
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* MANDATORY SCIENTIFIC ACCURACY DISCLAIMER */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex items-start space-x-2.5 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-semibold">Photo note:</strong> This preview does not upload or analyze the image. A photograph alone cannot determine soil pH or nutrient levels; use a soil test for those measurements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onPrev}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Farm Profile</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>Proceed to Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
