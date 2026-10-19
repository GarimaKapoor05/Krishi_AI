import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Sprout } from "lucide-react";
import { getCropRecommendation } from "../../services/cropRecommendation";
import { getFarmSeasonalClimate } from "../../services/weatherLocation";

const TRAINING_RANGES = {
  nitrogen: [0, 140],
  phosphorus: [5, 145],
  potassium: [5, 205],
  ph: [3.5, 9.94],
};

export function CropRecommendationPanel({ farmLocation, soilNutrients, soilTestDone, plannedSowingPeriod, farmingSeason, selectedCrop, onRecommendation, onSelectCrop }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    requestId.current += 1;
    setLoading(false);
    setRecommendation(null);
    setError("");
    onRecommendation(null);
  }, [
    farmLocation?.district,
    farmLocation?.state,
    soilNutrients?.nitrogen,
    soilNutrients?.phosphorus,
    soilNutrients?.potassium,
    soilNutrients?.ph,
    plannedSowingPeriod,
    farmingSeason,
  ]);

  const runRecommendation = async () => {
    const values = {
      N: Number(soilNutrients?.nitrogen),
      P: Number(soilNutrients?.phosphorus),
      K: Number(soilNutrients?.potassium),
      ph: Number(soilNutrients?.ph),
    };
    const rawValues = [soilNutrients?.nitrogen, soilNutrients?.phosphorus, soilNutrients?.potassium, soilNutrients?.ph];
    if (rawValues.some((value) => value === "" || value == null) || Object.values(values).some((value) => !Number.isFinite(value))) {
      setError("Enter all four values from a laboratory soil report first.");
      return;
    }
    const outsideTrainingRange = Object.entries(TRAINING_RANGES).filter(([key, [min, max]]) => {
      const value = key === "nitrogen" ? values.N : key === "phosphorus" ? values.P : key === "potassium" ? values.K : values.ph;
      return value < min || value > max;
    });
    if (outsideTrainingRange.length) {
      setError(`The model has no training examples for ${outsideTrainingRange.map(([key]) => key.toUpperCase()).join(", ")} at these values. Check the units and ask a local soil expert; we won't extrapolate.`);
      return;
    }

    setLoading(true);
    setError("");
    setRecommendation(null);
    const currentRequest = ++requestId.current;
    try {
      const climate = await getFarmSeasonalClimate(farmLocation, farmingSeason);
      const result = await getCropRecommendation({
        ...values,
        temperature: climate.temperature,
        humidity: climate.humidity,
        rainfall: climate.rainfall,
      });
      const saved = {
        ...result,
        weather_location: climate.locationName,
        weather_source: climate.source,
        climate_seasons_used: climate.seasonsUsed,
        farming_season: farmingSeason,
      };
      if (currentRequest === requestId.current) {
        setRecommendation(saved);
        onRecommendation(saved);
      }
    } catch (requestError) {
      if (currentRequest !== requestId.current) return;
      const serverMessage = requestError.response?.data?.error;
      const networkFailure = requestError.code === "ERR_NETWORK" || requestError.code === "ECONNREFUSED";
      setError(serverMessage || (networkFailure
        ? "The crop service could not be reached. Check that the Krishi AI backend is running, then try again."
        : requestError.message || "Crop suggestion could not be generated. Please try again."));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5 space-y-3" aria-labelledby="crop-recommendation-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <Sprout size={18} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h4 id="crop-recommendation-title" className="text-sm font-bold text-stone-900">Experimental crop shortlist</h4>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            This shortlist requires all four soil values. The Kaggle data does not verify NPK units or equivalence with lab methods. Use it only if a soil professional confirms your report uses a comparable scale; do not enter or convert ppm values yourself. If any value is missing, skip this optional estimate. Weather inputs are 10-year district normals, not field measurements.
          </p>
          {soilTestDone !== "yes" && <p className="mt-1 text-xs font-medium text-amber-800">A laboratory soil test is needed before this model can run. A soil photo cannot provide these measurements.</p>}
          {farmingSeason === "year_round" && <p className="mt-1 text-xs font-medium text-amber-800">Choose a target Kharif, Rabi, or Zaid season before requesting a crop shortlist.</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={runRecommendation}
        disabled={loading || soilTestDone !== "yes" || !["kharif", "rabi", "zaid"].includes(farmingSeason)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sprout size={16} />}
        {loading ? "Checking seasonal climate and crop data…" : "Get crop suggestions"}
      </button>

      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}

      {recommendation && (
        <div className="space-y-2 rounded-lg bg-emerald-50 p-3" aria-live="polite">
          <p className="text-sm font-bold text-emerald-950">
            Top dataset match: <span className="capitalize">{recommendation.recommended_crop}</span>
            <span className="ml-2 font-medium">(model score: {recommendation.confidence}/100)</span>
          </p>
          <div>
            <p className="mb-2 text-xs font-semibold text-stone-700">Choose a crop for your plan</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a crop from the model suggestions">
              {recommendation.top_predictions.map((item) => {
                const isSelected = selectedCrop?.toLocaleLowerCase() === item.crop?.toLocaleLowerCase();
                return (
                  <button
                    key={item.crop}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectCrop(item.crop)}
                    className={`min-h-10 rounded-full border px-3 py-2 text-xs font-semibold capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      isSelected
                        ? "border-emerald-800 bg-emerald-800 text-white"
                        : "border-emerald-200 bg-white text-stone-700 hover:bg-emerald-100"
                    }`}
                  >
                    {item.crop} · score {item.confidence}/100{isSelected ? " · Selected" : ""}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-stone-600">
            Climate basis: {recommendation.weather_source}, using {recommendation.climate_seasons_used} complete {recommendation.farming_season} seasons for {recommendation.weather_location}.
          </p>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-stone-600">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            Model scores are uncalibrated classifier outputs, not chances of success or yield. The Kaggle model has no district or season labels, and its NPK units are not verified against lab methods. Confirm suitability and input scales with a local agricultural officer before making a planting decision.
          </p>
        </div>
      )}
    </section>
  );
}
