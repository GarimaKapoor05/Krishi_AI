import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  Thermometer,
  Droplets,
  CloudRain,
  FlaskConical,
  Leaf,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function CropPrediction() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Farmer-friendly preset sample values
  const applyPreset = (preset) => {
    if (preset === "alluvial") {
      setFormData({ N: "90", P: "42", K: "43", temperature: "24", humidity: "82", ph: "6.5", rainfall: "202" });
    } else if (preset === "black") {
      setFormData({ N: "60", P: "55", K: "40", temperature: "28", humidity: "65", ph: "7.2", rainfall: "110" });
    } else if (preset === "red") {
      setFormData({ N: "40", P: "30", K: "35", temperature: "26", humidity: "70", ph: "6.0", rainfall: "95" });
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert(t("cropPrediction.errBackend", { defaultValue: "Unable to connect to AI server." }));
    }

    setLoading(false);
  };

  const soilNutrientFields = [
    {
      label: t("cropPrediction.fieldN"),
      sub: "Nitrogen (essential for leafy growth)",
      name: "N",
      icon: Leaf,
      placeholder: "e.g. 90",
      range: "Recommended: 0 - 140 kg/ha",
    },
    {
      label: t("cropPrediction.fieldP"),
      sub: "Phosphorus (root & flower development)",
      name: "P",
      icon: FlaskConical,
      placeholder: "e.g. 42",
      range: "Recommended: 5 - 145 kg/ha",
    },
    {
      label: t("cropPrediction.fieldK"),
      sub: "Potassium (disease resistance & yield)",
      name: "K",
      icon: Sprout,
      placeholder: "e.g. 43",
      range: "Recommended: 5 - 205 kg/ha",
    },
    {
      label: t("cropPrediction.fieldPh"),
      sub: "Soil pH (acidity / alkalinity level)",
      name: "ph",
      icon: FlaskConical,
      placeholder: "e.g. 6.5",
      range: "Optimal: 5.5 - 7.5",
    },
  ];

  const climateFields = [
    {
      label: t("cropPrediction.fieldTemp"),
      sub: "Average seasonal temperature",
      name: "temperature",
      icon: Thermometer,
      placeholder: "e.g. 25",
      unit: "°C",
    },
    {
      label: t("cropPrediction.fieldHumid"),
      sub: "Relative atmospheric moisture",
      name: "humidity",
      icon: Droplets,
      placeholder: "e.g. 80",
      unit: "%",
    },
    {
      label: t("cropPrediction.fieldRain"),
      sub: "Average seasonal rainfall",
      name: "rainfall",
      icon: CloudRain,
      placeholder: "e.g. 200",
      unit: "mm",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>AI Agronomic Recommendation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {t("cropPrediction.title", { defaultValue: "Crop Recommendation" })}
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            {t("cropPrediction.desc", {
              defaultValue:
                "Enter your soil nutrients and local weather conditions. KrishiAI's machine learning model predicts the highest-yielding crop for your specific farm.",
            })}
          </p>

          {/* Quick-fill Soil Preset Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <HelpCircle size={14} /> Quick demo presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("alluvial")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              🌾 Paddy Soil (Alluvial)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("black")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              🌱 Cotton Soil (Black)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("red")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              🥔 Pulses Soil (Red/Loamy)
            </button>
          </div>
        </motion.div>

        {/* ── Input Form ── */}
        <motion.form
          onSubmit={handlePredict}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-3xl shadow-card p-6 sm:p-10 border border-stone-200 dark:border-stone-800 space-y-8"
        >
          {/* Step 1: Soil Nutrients */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-stone-900 dark:text-white">
                  Soil Nutrient Profile
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Readings from your soil testing card or local Krishi Vigyan Kendra (KVK).
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {soilNutrientFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.name} className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                        {field.label}
                      </label>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">{field.range}</span>
                    </div>

                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                      <Icon className="text-emerald-700 dark:text-emerald-400 mr-3 shrink-0" size={18} />
                      <input
                        type="number"
                        step="any"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        className="w-full outline-none bg-transparent text-stone-900 dark:text-white text-sm sm:text-base font-semibold placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Climate & Weather Parameters */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-stone-900 dark:text-white">
                  Seasonal Weather Conditions
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Approximate local temperature, humidity, and rainfall during the crop cycle.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {climateFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                      {field.label}
                    </label>

                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                      <Icon className="text-amber-600 dark:text-amber-400 mr-3 shrink-0" size={18} />
                      <input
                        type="number"
                        step="any"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        className="w-full outline-none bg-transparent text-stone-900 dark:text-white text-sm sm:text-base font-semibold placeholder:font-normal placeholder:text-stone-400"
                      />
                      <span className="text-xs text-stone-400 font-bold ml-2">{field.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Real-time inference using 2200+ multi-parameter agricultural data points
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t("cropPrediction.analyzing", { defaultValue: "AI is analyzing..." })}</span>
                </>
              ) : (
                <>
                  <span>🌾 {t("cropPrediction.btnPredict", { defaultValue: "Predict Best Crop" })}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* ── Recommendation Result Section ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Primary Recommended Crop Showcase */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-white shadow-card relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 px-3.5 py-1.5 rounded-full">
                    <Sparkles size={14} /> Recommended for Your Field
                  </span>

                  <h2 className="text-4xl sm:text-5xl font-black capitalize tracking-tight text-white flex items-center gap-3">
                    <span>🌾</span>
                    <span>
                      {t(`crops.${result.recommended_crop}`, {
                        defaultValue: result.recommended_crop,
                      })}
                    </span>
                  </h2>

                  <p className="text-emerald-100/80 text-sm sm:text-base max-w-xl">
                    Based on your soil's NPK profile ({formData.N}-{formData.P}-{formData.K}) and climate conditions, this crop promises optimal root establishment and maximum yield.
                  </p>
                </div>

                {/* Confidence Meter Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 lg:w-80 shrink-0">
                  <div className="flex items-center justify-between text-sm font-semibold mb-2">
                    <span className="text-emerald-200">
                      {t("cropPrediction.confidence", { defaultValue: "Model Confidence" })}
                    </span>
                    <span className="text-2xl font-black text-white">
                      {result.confidence}%
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    />
                  </div>

                  <p className="text-[11px] text-emerald-200/70 mt-2.5">
                    High certainty based on Random Forest ensemble match.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Predictions & Ranked Alternatives */}
            {result.top_predictions && result.top_predictions.length > 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
                <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>🥇</span>
                  <span>{t("cropPrediction.topPredictions", { defaultValue: "Top Predictions" })}</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                  Alternative viable crops suited for your environmental parameters.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {result.top_predictions.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        index === 0
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                          : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                          {index === 0 ? "🥇 Rank 1" : index === 1 ? "🥈 Rank 2" : "🥉 Rank 3"}
                        </span>
                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                          {item.confidence}%
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-stone-900 dark:text-white capitalize">
                        {t(`crops.${item.crop}`, { defaultValue: item.crop })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fertilizer Guidance for Selected Crop */}
            {result.fertilizer_advice && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <span>🌱</span>
                      <span>{t("cropPrediction.fertilizerAdvisor", { defaultValue: "Fertilizer Guidance" })}</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Comparing your soil's actual nutrients against ideal levels for {result.recommended_crop}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/fertilizer-prediction", {
                        state: {
                          crop: result.recommended_crop,
                          N: formData.N,
                          P: formData.P,
                          K: formData.K,
                        },
                      })
                    }
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition"
                  >
                    <span>{t("cropPrediction.getDosage", { defaultValue: "Calculate Land Dosage" })}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* NPK Comparison Columns */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
                      {t("cropPrediction.idealNpk", { defaultValue: "Ideal Target NPK" })}
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Nitrogen</span>
                        <span className="text-xl font-black text-emerald-800 dark:text-emerald-400">{result.fertilizer_advice.ideal_npk.N}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Phosphorus</span>
                        <span className="text-xl font-black text-amber-700 dark:text-amber-400">{result.fertilizer_advice.ideal_npk.P}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Potassium</span>
                        <span className="text-xl font-black text-sky-700 dark:text-sky-400">{result.fertilizer_advice.ideal_npk.K}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-3">
                      {t("cropPrediction.yourSoil", { defaultValue: "Your Tested Soil NPK" })}
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Nitrogen</span>
                        <span className="text-xl font-black text-stone-900 dark:text-white">{result.fertilizer_advice.user_npk.N}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Phosphorus</span>
                        <span className="text-xl font-black text-stone-900 dark:text-white">{result.fertilizer_advice.user_npk.P}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="text-xs text-stone-400 block font-medium">Potassium</span>
                        <span className="text-xl font-black text-stone-900 dark:text-white">{result.fertilizer_advice.user_npk.K}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agronomic Recommendations */}
                {result.fertilizer_advice.suggestions && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {t("cropPrediction.suggestions", { defaultValue: "Agronomic Advice" })}:
                    </h4>
                    {result.fertilizer_advice.suggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-sm text-emerald-950 dark:text-emerald-200"
                      >
                        <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}