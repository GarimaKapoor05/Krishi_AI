import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import { useTranslation } from "react-i18next";
import {
  Droplets,
  Thermometer,
  CloudRain,
  Leaf,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export default function SmartIrrigationAdvisor() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    moisture: "",
    humidity: "",
    temp: "",
    et: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const applyPreset = (type) => {
    if (type === "dry") {
      setFormData({ moisture: "18", humidity: "45", temp: "34", et: "6.2" });
    } else if (type === "adequate") {
      setFormData({ moisture: "48", humidity: "75", temp: "26", et: "3.8" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        moisture: parseFloat(formData.moisture),
        humidity: parseFloat(formData.humidity),
        temp: parseFloat(formData.temp),
        et: parseFloat(formData.et || 4.5),
      };

      const response = await fetch(`${API_URL}/irrigation/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendation.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        t("irrigationAdvisor.errBackend", {
          defaultValue:
            "Unable to connect to the AI service. Please ensure the Flask backend is running.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const priorityStyle = {
    High: {
      badge: "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800",
      icon: "🔴",
      gradient: "from-red-900 via-rose-900 to-stone-900",
    },
    Medium: {
      badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      icon: "🟡",
      gradient: "from-amber-900 via-yellow-900 to-stone-900",
    },
    Low: {
      badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      icon: "🟢",
      gradient: "from-emerald-900 via-teal-900 to-stone-900",
    },
  };

  const isNoIrrigation = result?.recommendation?.toLowerCase().includes("no");

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-300/60 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs sm:text-sm font-bold shadow-xs">
            <Droplets size={16} className="text-sky-700 dark:text-sky-400" />
            <span>Smart Moisture & Water Schedule Advisor</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {t("irrigationAdvisor.title", { defaultValue: "Smart Irrigation Advisor" })}
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            {t("irrigationAdvisor.desc", {
              defaultValue:
                "Enter your field's soil moisture and weather conditions. KrishiAI tells you immediately whether watering is needed today, saving water and preventing root rot.",
            })}
          </p>

          {/* Quick presets */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className="text-stone-500 dark:text-stone-400">Quick field scenarios:</span>
            <button
              type="button"
              onClick={() => applyPreset("dry")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-sky-500 text-stone-700 dark:text-stone-200 transition"
            >
              ☀️ Dry Soil (Moisture 18%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("adequate")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-sky-500 text-stone-700 dark:text-stone-200 transition"
            >
              💧 Moist Soil (Moisture 48%)
            </button>
          </div>
        </motion.div>

        {/* ── Input Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-3xl shadow-card p-6 sm:p-10 border border-stone-200 dark:border-stone-800 space-y-8"
        >
          <div>
            <h2 className="font-extrabold text-lg text-stone-900 dark:text-white">
              {t("irrigationAdvisor.fieldConditions", { defaultValue: "Field Sensor Readings" })}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {t("irrigationAdvisor.demoNote", { defaultValue: "Readings from soil probe or approximate field moisture." })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  name: "moisture",
                  label: t("irrigationAdvisor.moisture", { defaultValue: "Soil Moisture (%)" }),
                  sub: "Crucial indicator of root-zone water",
                  placeholder: t("irrigationAdvisor.placeholderMoisture", { defaultValue: "e.g. 25" }),
                  icon: Droplets,
                  color: "text-sky-600",
                },
                {
                  name: "humidity",
                  label: t("irrigationAdvisor.humidity", { defaultValue: "Air Humidity (%)" }),
                  sub: "Atmospheric relative humidity",
                  placeholder: t("irrigationAdvisor.placeholderHumidity", { defaultValue: "e.g. 65" }),
                  icon: CloudRain,
                  color: "text-blue-600",
                },
                {
                  name: "temp",
                  label: t("irrigationAdvisor.temp", { defaultValue: "Temperature (°C)" }),
                  sub: "Ambient field heat index",
                  placeholder: t("irrigationAdvisor.placeholderTemp", { defaultValue: "e.g. 30" }),
                  icon: Thermometer,
                  color: "text-amber-600",
                },
                {
                  name: "et",
                  label: t("irrigationAdvisor.et", { defaultValue: "Evapotranspiration (mm/day)" }),
                  sub: "Moisture evaporation rate (Default: 4.5)",
                  placeholder: t("irrigationAdvisor.placeholderEt", { defaultValue: "e.g. 5.3" }),
                  icon: Leaf,
                  color: "text-emerald-600",
                },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.name} className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                        {field.label}
                      </label>
                      <span className="text-[11px] text-stone-400">{field.sub}</span>
                    </div>

                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                      <Icon className={`${field.color} mr-3 shrink-0`} size={18} />
                      <input
                        type="number"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        step="0.1"
                        required
                        className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm sm:text-base placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                FAO Evapotranspiration formula & soil saturation threshold calculation
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[260px] bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{t("irrigationAdvisor.generating", { defaultValue: "Generating Recommendation..." })}</span>
                  </>
                ) : (
                  <>
                    <span>💧 {t("irrigationAdvisor.btnPredict", { defaultValue: "Check Irrigation Need" })}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 flex gap-3 text-red-800 dark:text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </motion.div>

        {/* ── Results Section ── */}
        <div ref={resultRef}>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Primary Decision Banner */}
              <div
                className={`bg-gradient-to-br ${
                  isNoIrrigation
                    ? "from-emerald-900 via-teal-900 to-stone-900"
                    : "from-sky-950 via-blue-900 to-stone-900"
                } rounded-3xl p-8 sm:p-10 text-white shadow-card relative overflow-hidden`}
              >
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider bg-black/40 text-emerald-300 border border-white/10 px-3.5 py-1.5 rounded-full">
                        AI Irrigation Decision
                      </span>

                      {result.urgency && (
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                            priorityStyle[result.urgency]?.badge || "bg-stone-800 text-white"
                          }`}
                        >
                          {priorityStyle[result.urgency]?.icon} {result.urgency}{" "}
                          {t("irrigationAdvisor.priority", { defaultValue: "Priority" })}
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                      <span>{isNoIrrigation ? "🌱" : "💧"}</span>
                      <span>{result.recommendation}</span>
                    </h2>

                    <p className="text-stone-200 text-sm sm:text-base max-w-xl">
                      {result.advice || t("irrigationAdvisor.recDesc", { defaultValue: "Generated using your real-time field moisture readings." })}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shrink-0 text-center md:min-w-[200px]">
                    <span className="text-xs text-sky-200 block font-semibold mb-1">
                      {t("irrigationAdvisor.waterRequired", { defaultValue: "Water Required" })}
                    </span>
                    <span className="text-4xl font-black text-white">
                      {result.water_amount_mm ?? 0}
                    </span>
                    <span className="text-xs text-sky-200 block mt-1">mm depth</span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-card">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    {t("irrigationAdvisor.recMethod", { defaultValue: "Recommended Technique" })}
                  </p>
                  <h4 className="text-2xl font-black text-stone-900 dark:text-white">
                    {isNoIrrigation ? "Soil Monitoring" : "Drip Irrigation"}
                  </h4>
                  <p className="text-xs text-stone-400 mt-2">
                    {isNoIrrigation
                      ? "Root moisture remains within acceptable threshold."
                      : "Direct root application minimizes solar evaporation loss."}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-card">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    {t("irrigationAdvisor.nextIrrigation", { defaultValue: "Next Re-check Window" })}
                  </p>
                  <h4 className="text-2xl font-black text-emerald-800 dark:text-emerald-400">
                    {isNoIrrigation ? "24+ Hours" : "Immediate Cycle"}
                  </h4>
                  <p className="text-xs text-stone-400 mt-2">
                    Check sensor after morning evapotranspiration cycle.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-card">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    {t("irrigationAdvisor.estSavings", { defaultValue: "Estimated Water Saved" })}
                  </p>
                  <h4 className="text-2xl font-black text-sky-700 dark:text-sky-400">
                    {Math.max(0, Math.round(parseFloat(formData.et || 4.5) * 2))}%
                  </h4>
                  <p className="text-xs text-stone-400 mt-2">
                    Compared to traditional surface flood irrigation.
                  </p>
                </div>
              </div>

              {/* Agronomic Observations */}
              {result.insights && result.insights.length > 0 && (
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-8 space-y-4">
                  <h3 className="font-extrabold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-emerald-700 dark:text-emerald-400" size={20} />
                    <span>{t("irrigationAdvisor.fieldObs", { defaultValue: "Agronomic Field Insights" })}</span>
                  </h3>

                  <div className="space-y-3">
                    {result.insights.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 text-sm text-stone-800 dark:text-stone-200"
                      >
                        <Info className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}