import React, { useState } from "react";
import {
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Edit2,
  User,
  MapPin,
  Sprout,
  Compass,
  AlertCircle
} from "lucide-react";
import { SOIL_TYPES, IRRIGATION_SOURCES, FARMING_SEASONS } from "../../data/onboardingConstants";

export function Step4Review({
  profile,
  onGoToStep,
  onComplete,
  onPrev,
  isSubmitting = false,
  serverError = null
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!confirmed) {
      setValidationError("Please check the confirmation box before finalizing your profile.");
      return;
    }
    setValidationError(null);
    onComplete();
  };

  // Helper label finders
  const soilLabel =
    SOIL_TYPES.find((s) => s.id === profile.farmLocation.soilType)?.name ||
    profile.farmLocation.soilType ||
    "Not specified";

  const irrigationLabel =
    IRRIGATION_SOURCES.find((s) => s.id === profile.farmLocation.irrigationSource)?.label ||
    profile.farmLocation.irrigationSource ||
    "Not specified";

  const seasonLabel =
    FARMING_SEASONS.find((s) => s.id === profile.farmLocation.preferredSeason)?.label ||
    profile.farmLocation.preferredSeason ||
    "Not specified";

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-primary p-6 sm:p-8 text-white">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-brand-mint text-xs font-semibold mb-3">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Step 4 of 4 &bull; Review &amp; Confirmation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight mb-2">
          Verify Your Farm Profile
        </h1>
        <p className="text-brand-mint/90 text-sm sm:text-base leading-relaxed max-w-2xl">
          Review your details below. You can click "Edit" on any section to revise your information before submitting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Section 1: Farmer Account */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-mint text-brand-green">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                1. Farmer Account Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-brand-green hover:bg-brand-mint/30 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Farmer Name</span>
              <span className="font-bold text-stone-800 text-sm">
                {profile.account.firstName} {profile.account.lastName}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Email Address</span>
              <span className="font-bold text-stone-800 text-sm">
                {profile.account.email}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Password</span>
              <span className="font-bold text-stone-700 text-sm">
                Not shown or saved in your profile
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Farm Location & Soil */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-mint text-brand-green">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                2. Land Geography &amp; Resources
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-brand-green hover:bg-brand-mint/30 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Village / Town</span>
              <span className="font-bold text-stone-800">
                {profile.farmLocation.village || "—"}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">District &amp; State</span>
              <span className="font-bold text-stone-800">
                {profile.farmLocation.district}, {profile.farmLocation.state}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">PIN Code</span>
              <span className="font-bold text-stone-800">
                {profile.farmLocation.pincode || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Land Size</span>
              <span className="font-bold text-stone-800">
                {profile.farmLocation.farmSize} {profile.farmLocation.measurementUnit}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Soil Type</span>
              <span className="font-bold text-stone-800">{soilLabel}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Irrigation Source</span>
              <span className="font-bold text-stone-800">{irrigationLabel}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Water Availability</span>
              <span className="font-bold text-stone-800 capitalize">
                {profile.farmLocation.waterAvailability}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Preferred Season</span>
              <span className="font-bold text-stone-800">{seasonLabel}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Farming Status & Details */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-mint text-brand-green">
                {profile.farmingStatus === "active" ? (
                  <Sprout className="w-4 h-4" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                3. Crop Activity (
                {profile.farmingStatus === "active"
                  ? "Currently Cultivating"
                  : "Season Planning"}
                )
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-brand-green hover:bg-brand-mint/30 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {profile.farmingStatus === "active" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block font-medium">Standing Crop</span>
                <span className="font-bold text-stone-800 text-sm">
                  {profile.activeFarming.cropName}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Sowing Date</span>
                <span className="font-bold text-stone-800">
                  {profile.activeFarming.sowingDate}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Crop Stage</span>
                <span className="font-bold text-stone-800 capitalize">
                  {profile.activeFarming.cropStage || "Unspecified"}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Irrigation Schedule</span>
                <span className="font-bold text-stone-800">
                  {profile.activeFarming.irrigationFrequency || "Default"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <span className="text-stone-400 block font-medium mb-1">
                  Fertilizers Applied
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.activeFarming.fertilizersUsed?.length ? (
                    profile.activeFarming.fertilizersUsed.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold"
                      >
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500 italic">None recorded</span>
                  )}
                </div>
              </div>
              {profile.planningFarming.cropRecommendation && (
                <div className="col-span-2 sm:col-span-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <span className="text-stone-500 block text-xs font-medium">Model shortlist</span>
                  <span className="font-bold capitalize text-emerald-950">
                    {profile.planningFarming.cropRecommendation.recommended_crop}
                  </span>
                  <span className="ml-2 text-xs text-stone-600">
                    {profile.planningFarming.cropRecommendation.confidence}% dataset match · short-term weather for {profile.planningFarming.cropRecommendation.weather_location}; confirm seasonal suitability locally
                  </span>
                </div>
              )}
              {profile.planningFarming.primaryCrop && (
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-stone-400 block font-medium">Crop selected for your plan</span>
                  <span className="font-bold capitalize text-stone-800">{profile.planningFarming.primaryCrop}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block font-medium">Planned Sowing</span>
                <span className="font-bold text-stone-800">
                  {profile.planningFarming.plannedSowingPeriod}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Target Season</span>
                <span className="font-bold text-stone-800 capitalize">
                  {profile.planningFarming.farmingSeason}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Soil Test Status</span>
                <span className="font-bold text-stone-800">
                  {profile.planningFarming.soilTestDone === "yes"
                    ? "Laboratory Test Provided"
                    : "No Test Values"}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Soil Photo</span>
                <span className="font-bold text-stone-800">
                  {profile.planningFarming.soilPhoto ? "Attached" : "None"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <span className="text-stone-400 block font-medium mb-1">
                  Crops of Interest
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.planningFarming.interestedCrops?.length ? (
                    profile.planningFarming.interestedCrops.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500 italic">No crops selected yet</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="pt-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                setValidationError(null);
              }}
              className="mt-1 w-4 h-4 rounded text-brand-green focus:ring-brand-emerald border-stone-300"
            />
            <span className="text-xs text-stone-700 leading-normal font-medium">
              I confirm that the information above is accurate to the best of my knowledge. My farm profile is saved in this browser. Crop suggestions, if generated, are preliminary model estimates and are not a guarantee of seasonal suitability.
            </span>
          </label>
          {validationError && (
            <p className="text-xs text-red-600 mt-1 font-semibold">{validationError}</p>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onPrev}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Farming Status</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Finalizing Farm Profile...</span>
            ) : (
              <>
                <span>Complete Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
