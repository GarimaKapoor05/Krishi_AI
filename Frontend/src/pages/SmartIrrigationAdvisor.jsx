import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import { getFarmWeather } from "../services/weatherLocation";
import { getFarmCrop, readFarmProfile } from "../services/farmProfile";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Droplets,
  Info,
  Leaf,
  Loader2,
  MapPin,
  Sprout,
  Wheat,
} from "lucide-react";

const SOILS = [
  ["alluvial", "River soil"],
  ["black", "Black soil"],
  ["red_yellow", "Red soil"],
  ["laterite", "Laterite (hard red soil)"],
  ["arid_sandy", "Sandy soil"],
  ["loamy_clay", "Clay or mixed soil"],
  ["unknown", "I don't know"],
];

const formatStage = (value = "") => ({
  Initial: "Newly planted", "Germination / emergence": "New shoots", "Crop development": "Growing",
  "Vegetative growth": "Growing leaves and stems", "Mid-season": "Flowering or fruiting",
  Flowering: "Flowering", "Fruiting / grain formation": "Fruit or grain growing",
  "Late season": "Ripening", "Ripening / maturity": "Ripening", "Harvest ready": "Ready to harvest",
}[value] || value);
const formatRecommendation = (value = "") => value.startsWith("Irrigation likely needed")
  ? "Check the soil today. If it feels dry near the roots, water your crop."
  : value.startsWith("Plan to irrigate around")
    ? `Check the soil around ${formatDay(value.split(" ").at(-1))}. Water only if it feels dry near the roots.`
    : "This estimate does not show a need to water this week. Keep checking the soil.";

const formatDay = (value) => new Intl.DateTimeFormat("en-IN", {
  weekday: "short", day: "numeric", month: "short",
}).format(new Date(`${value}T00:00:00`));

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const asHectares = (area, unit) => {
  const parsed = Number(area);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return String(unit === "acres" ? parsed * 0.404686 : parsed);
};

function Metric({ label, value, detail, icon: Icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    stone: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-white">{value}</p>
          {detail && <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">{detail}</p>}
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={17} /></span>
      </div>
    </div>
  );
}

export default function SmartIrrigationAdvisor() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("Loading your farm's seven-day forecast…");
  const [formData, setFormData] = useState(() => {
    const profile = readFarmProfile();
    const location = profile?.farmLocation || {};
    const active = profile?.farmingStatus === "active";
    return {
      crop: getFarmCrop(profile),
      sowing_date: active ? profile?.activeFarming?.sowingDate || "" : profile?.planningFarming?.plannedSowingPeriod || "",
      crop_stage: active ? profile?.activeFarming?.cropStage || "" : "",
      soil_type: location.soilType || "unknown",
      area_ha: asHectares(location.farmSize, location.measurementUnit),
      field_condition: "",
    };
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const knownCrops = useMemo(() => [
    "Wheat", "Rice", "Maize", "Tomato", "Potato", "Cotton", "Soybean", "Mustard",
    "Sugarcane", "Chickpea", "Groundnut", "Millet", "Onion", "Chili", "Mango",
  ], []);

  useEffect(() => {
    let active = true;
    const profile = readFarmProfile();
    const farmLocation = profile?.farmLocation;
    if (!farmLocation) {
      setWeatherStatus("Add your farm location during setup to get local weather automatically.");
      return () => { active = false; };
    }

    getFarmWeather(farmLocation).then((data) => {
      if (!active) return;
      setWeather(data);
      setWeatherStatus(`${data.locationName} · local 7-day forecast`);
    }).catch((weatherError) => {
      if (active) setWeatherStatus(weatherError.message || "Local weather is unavailable. Try again later.");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (result) setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!weather?.days?.length) {
      setError("We need your farm location to get local weather. Check your saved location and try again.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        forecast: weather.days.map(({ date, et0_mm, rainfall_mm }) => ({ date, et0_mm, rainfall_mm })),
      };
      const response = await fetch(`${API_URL}/irrigation/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Irrigation service returned ${response.status}.`);
      if (!Array.isArray(data.daily)) throw new Error("The backend needs the updated crop-water scheduler. Restart the backend and try again.");
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || t("irrigationAdvisor.errBackend", { defaultValue: "Unable to create an irrigation estimate. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  const priority = result?.urgency === "High"
    ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
    : result?.urgency === "Medium"
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";

  return (
    <div className="min-h-screen bg-bg-light px-4 pb-16 pt-24 text-stone-900 transition-colors dark:bg-bg-dark dark:text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-end sm:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200"><Droplets size={14} /> Watering plan</div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{t("irrigationAdvisor.title", { defaultValue: "Smart Irrigation Advisor" })}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">See how much water your crop may use this week, how rain may help, and when to check the soil before watering.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 sm:max-w-64"><MapPin size={15} className="shrink-0 text-emerald-700" /><span>{weatherStatus}</span></div>
        </motion.header>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(290px,0.9fr)]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Your crop and field</h2>
              <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">Your saved farm details are filled in for you. Change them only if this field is different.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                Crop
                <input list="irrigation-crop-options" name="crop" value={formData.crop} onChange={handleChange} required placeholder="Choose or type a crop" className="input-base" />
                <datalist id="irrigation-crop-options">{knownCrops.map((crop) => <option key={crop} value={crop} />)}</datalist>
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                Planting date
                <input type="date" name="sowing_date" value={formData.sowing_date} onChange={handleChange} required max={localToday()} className="input-base" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                What kind of soil do you have?
                <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="input-base">{SOILS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                What is the crop doing now? <span className="font-normal text-stone-400">(optional)</span>
                <select name="crop_stage" value={formData.crop_stage} onChange={handleChange} className="input-base">
                  <option value="">Work it out from planting date</option>
                  <option value="germination">Just planted / new shoots</option>
                  <option value="vegetative">Growing leaves and stems</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Flowers or fruit / grain growing</option>
                  <option value="ripening">Fruit or grain ripening</option>
                  <option value="harvest">Ready to harvest</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                Farm area <span className="font-normal text-stone-400">(optional)</span>
                <div className="flex gap-2">
                  <input type="number" name="area_ha" min="0" step="0.01" value={formData.area_ha} onChange={handleChange} placeholder="e.g. 1.2" className="input-base min-w-0 flex-1" />
                  <span className="inline-flex items-center rounded-xl border border-stone-200 px-3 text-xs text-stone-500 dark:border-stone-700">hectares</span>
                </div>
              </label>
            </div>

            <fieldset>
              <legend className="text-xs font-semibold text-stone-700 dark:text-stone-300">Touch the soil near the plant roots. How does it feel?</legend>
              <p className="mb-2 mt-1 text-[11px] text-stone-500 dark:text-stone-400">This quick check helps us make a better estimate. It is not a sensor reading.</p>
              <div className="grid grid-cols-3 gap-2">
                {[["wet", "Still wet", "Feels damp"], ["moist", "A little moist", "Some moisture"], ["dry", "Dry to touch", "Feels dry"]].map(([value, label, hint]) => (
                  <button key={value} type="button" aria-pressed={formData.field_condition === value} onClick={() => { setFormData((previous) => ({ ...previous, field_condition: value })); setResult(null); }} className={`min-h-16 rounded-xl border px-2 py-2 text-left transition ${formData.field_condition === value ? "border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700 dark:bg-emerald-950/40" : "border-stone-200 hover:border-stone-400 dark:border-stone-700"}`}>
                    <span className="block text-xs font-bold">{label}</span><span className="mt-0.5 block text-[10px] text-stone-500 dark:text-stone-400">{hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400"><Info size={14} className="mt-0.5 shrink-0 text-sky-700" /> We use your farm’s seven-day weather forecast. No need to enter the weather again.</p>
              <button type="submit" disabled={loading || !weather?.days?.length || !formData.field_condition} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Making your watering plan…</> : <>Make my watering plan <ArrowRight size={16} /></>}
              </button>
            </div>
            {error && <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"><AlertTriangle size={17} className="mt-0.5 shrink-0" />{error}</div>}
          </form>

          <aside className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900/70 sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><Sprout size={19} /></span><div><h2 className="text-sm font-bold">How this estimate helps</h2><p className="text-[11px] text-stone-500 dark:text-stone-400">Your farm details and local weather</p></div></div>
            <div className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              <div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" /><p><strong className="text-stone-800 dark:text-stone-100">Your crop:</strong> we use your crop and planting date to estimate its growth stage.</p></div>
              <div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" /><p><strong className="text-stone-800 dark:text-stone-100">Rain:</strong> expected rain may reduce how much extra water the field needs.</p></div>
              <div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" /><p><strong className="text-stone-800 dark:text-stone-100">Your soil:</strong> soil type helps us estimate how long the field may hold water.</p></div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">This is a field-planning estimate, not a guaranteed irrigation prescription. Actual soil water capacity, crop variety, rain infiltration, slope, and irrigation-system losses vary.</div>
          </aside>
        </motion.section>

        <div ref={resultRef}>
          {result && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 scroll-mt-24" aria-live="polite">
              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div><p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Your watering plan for the next 7 days</p><h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{formatRecommendation(result.recommendation)}</h2><p className="mt-1 text-xs text-stone-600 dark:text-stone-300">Crop stage: {formatStage(result.current_stage)} · Day {result.crop_age_days + 1}</p></div>
                  <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${priority}`}>{result.urgency === "High" ? "Check today" : result.urgency === "Medium" ? "Check soon" : "Low need"}</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Water your crop may use this week" value={`${result.crop_water_demand_7d_mm} mm`} detail="mm means a thin layer of water (1 litre per square metre)" icon={Leaf} />
                  <Metric label="Rain that may soak in" value={`${result.effective_rainfall_7d_mm} mm`} detail="Estimated from this week’s forecast" icon={CloudRain} tone="blue" />
                  <Metric label="Extra water estimate" value={`${result.water_amount_mm} mm`} detail={result.trigger_date ? `Check soil around ${formatDay(result.trigger_date)}` : "Check the soil before watering"} icon={Droplets} tone={result.water_amount_mm ? "amber" : "emerald"} />
                  <Metric label="For your whole farm" value={result.water_volume_m3 == null ? (result.water_amount_mm ? "Add farm area" : "—") : `${Math.round(result.water_volume_m3 * 1000).toLocaleString("en-IN")} litres`} detail={result.area_ha ? `For ${result.area_ha} hectares · estimated amount` : "Farm area not available"} icon={Wheat} tone="stone" />
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/40"><CalendarDays size={15} className="text-emerald-700" /><h3 className="text-xs font-bold">Each day: crop water and rain</h3></div>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {result.daily.map((day) => <div key={day.date} className="grid grid-cols-[minmax(78px,1.25fr)_minmax(60px,1fr)_repeat(3,minmax(32px,0.45fr))] items-center gap-2 px-3 py-3 text-[11px] sm:grid-cols-[minmax(100px,1.2fr)_minmax(120px,1fr)_repeat(3,minmax(54px,0.65fr))] sm:px-4 sm:text-xs">
                      <div className="min-w-0"><p className="font-semibold text-stone-800 dark:text-stone-100">{formatDay(day.date)}</p><p className="mt-0.5 truncate text-[10px] text-stone-500">{formatStage(day.stage)}</p></div>
                      <div className="min-w-0 text-stone-600 dark:text-stone-300">{day.trigger ? <span className="inline-flex rounded-full bg-amber-100 px-1.5 py-1 text-[9px] font-bold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 sm:px-2 sm:text-[10px]"><span className="sm:hidden">Water</span><span className="hidden sm:inline">Water today</span></span> : <span className="break-words">{day.root_zone_depletion_mm} mm soil may dry</span>}</div>
                      <div className="text-right"><span className="block text-[9px] text-stone-400">Crop water</span><span className="font-semibold">{day.etc_mm}</span></div>
                      <div className="text-right"><span className="block text-[9px] text-stone-400">Rain</span><span className="font-semibold">{day.rainfall_mm}</span></div>
                      <div className="text-right"><span className="block text-[9px] text-stone-400">Stage</span><span className="font-semibold">{day.kc}</span></div>
                    </div>)}
                  </div>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">{result.advice}</p>
                <details className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-600 dark:border-stone-800 dark:bg-stone-950/30 dark:text-stone-300"><summary className="cursor-pointer font-semibold">How did we work this out?</summary><p className="mt-2 leading-relaxed">The estimate uses your crop, planting date, soil type and the next 7 days of weather. It estimates crop water use and subtracts some expected rain. Soil and field conditions differ, so touch the soil before watering. This is a guide, not a guaranteed schedule.</p></details>
                <p className="mt-1 text-[10px] text-stone-400">This is an estimate from your crop, growth stage, soil type and local weather. Check the soil before watering; your field may differ.</p>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
