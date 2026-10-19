import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Sprout } from "lucide-react";
import { getCropRecommendation } from "../../services/cropRecommendation";
import { getFarmWeather } from "../../services/weatherLocation";

const getClimateSnapshot = (days = []) => {
  const usable = days.filter((day) =>
    day.temp_max_c != null && day.temp_min_c != null && day.humidity_percent != null && day.rainfall_mm != null &&
    Number.isFinite(Number(day.temp_max_c)) &&
    Number.isFinite(Number(day.temp_min_c)) &&
    Number.isFinite(Number(day.humidity_percent)) &&
    Number.isFinite(Number(day.rainfall_mm))
  );
  if (usable.length < 5) {
    throw new Error("The local forecast does not include enough temperature, humidity, and rainfall data for a crop estimate.");
  }
  return {
    temperature: usable.reduce((sum, day) => sum + (Number(day.temp_max_c) + Number(day.temp_min_c)) / 2, 0) / usable.length,
    humidity: usable.reduce((sum, day) => sum + Number(day.humidity_percent), 0) / usable.length,
    rainfall: usable.reduce((sum, day) => sum + Number(day.rainfall_mm), 0),
  };
};

export function CropRecommendationPanel({ farmLocation, soilNutrients, soilTestDone, plannedSowingPeriod, farmingSeason, onRecommendation, onSelectCrop }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
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
    if (rawValues.some((value) => value === "" || value == null) || Object.values(values).some((value) => !Number.isFinite(value)) || values.N < 0 || values.P < 0 || values.K < 0 || values.ph < 0 || values.ph > 14) {
      setError("Enter valid N, P, K, and soil pH values from a soil test first.");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendation(null);
    try {
      const weather = await getFarmWeather(farmLocation);
      const climate = getClimateSnapshot(weather.days);
      const result = await getCropRecommendation({ ...values, ...climate });
      const saved = {
        ...result,
        weather_location: weather.locationName,
        weather_fetched_at: weather.meta?.fetched_at || null,
        weather_days_used: weather.days.length,
      };
      setRecommendation(saved);
      onRecommendation(saved);
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.error;
      const networkFailure = requestError.code === "ERR_NETWORK" || requestError.code === "ECONNREFUSED";
      setError(serverMessage || (networkFailure
        ? "The crop service could not be reached. Check that the Krishi AI backend is running, then try again."
        : requestError.message || "Crop suggestion could not be generated. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5 space-y-3" aria-labelledby="crop-recommendation-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <Sprout size={18} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h4 id="crop-recommendation-title" className="text-sm font-bold text-stone-900">Crop suggestions from your soil test</h4>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Add N, P, K, and pH from a lab test above. We’ll combine them with local weather and the crop model for an experimental shortlist. It is not a season-specific agronomy recommendation or a yield guarantee.
          </p>
          {soilTestDone !== "yes" && <p className="mt-1 text-xs font-medium text-amber-800">A laboratory soil test is needed before this model can run. A soil photo cannot provide these measurements.</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={runRecommendation}
        disabled={loading || soilTestDone !== "yes"}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sprout size={16} />}
        {loading ? "Checking local weather and crop data…" : "Get crop suggestions"}
      </button>

      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}

      {recommendation && (
        <div className="space-y-2 rounded-lg bg-emerald-50 p-3" aria-live="polite">
          <p className="text-sm font-bold text-emerald-950">
            Top suggestion: <span className="capitalize">{recommendation.recommended_crop}</span>
            <span className="ml-2 font-medium">(dataset match: {recommendation.confidence}%)</span>
          </p>
          <ol className="flex flex-wrap gap-2">
            {recommendation.top_predictions.map((item) => (
              <li key={item.crop} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium capitalize text-stone-700">
                {item.crop} · {item.confidence}% match
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => onSelectCrop(recommendation.recommended_crop)}
            className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Use {recommendation.recommended_crop} as my planned crop
          </button>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-stone-600">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            Match percentages are model scores, not chances of success. Weather uses the next 7 days, so confirm the crop suits your planned season with a local agricultural officer.
          </p>
        </div>
      )}
    </section>
  );
}
