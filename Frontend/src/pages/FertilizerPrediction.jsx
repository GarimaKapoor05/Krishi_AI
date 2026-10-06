import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  FlaskConical,
  Leaf,
  Loader2,
  Ruler,
  Recycle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Scale,
  ArrowRight,
} from "lucide-react";

const CROP_OPTIONS = [
  "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans",
  "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango",
  "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya",
  "coconut", "cotton", "jute", "coffee",
];

export default function FertilizerPrediction() {
  const { t } = useTranslation();
  const location = useLocation();
  const prefill = location.state || {};

  const [formData, setFormData] = useState({
    crop: prefill.crop || "",
    N: prefill.N ?? "",
    P: prefill.P ?? "",
    K: prefill.K ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [landArea, setLandArea] = useState("");
  const [useOrganic, setUseOrganic] = useState(false);
  const [dosageLoading, setDosageLoading] = useState(false);
  const [dosage, setDosage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setDosage(null);

    try {
      const response = await fetch(`${API_URL}/predict-fertilizer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: formData.crop,
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("fertilizerPrediction.errWrong", { defaultValue: "Something went wrong." }));
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      alert(t("fertilizerPrediction.errBackend", { defaultValue: "Unable to connect to AI server." }));
    }

    setLoading(false);
  };

  const handleGetDosage = async () => {
    if (!landArea || Number(landArea) <= 0) {
      alert(t("fertilizerPrediction.alertArea", { defaultValue: "Please enter your land area in hectares." }));
      return;
    }

    setDosageLoading(true);
    setDosage(null);

    try {
      const response = await fetch(`${API_URL}/fertilizer-dosage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: formData.crop,
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          land_area_ha: Number(landArea),
          use_organic: useOrganic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("fertilizerPrediction.errWrong", { defaultValue: "Something went wrong." }));
        setDosageLoading(false);
        return;
      }

      setDosage(data);
    } catch (err) {
      console.error(err);
      alert(t("fertilizerPrediction.errBackend", { defaultValue: "Unable to connect to AI server." }));
    }

    setDosageLoading(false);
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold shadow-xs">
            <Scale size={16} className="text-amber-700 dark:text-amber-400" />
            <span>Soil Nutrient Balancing & Dosage Optimization</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {t("fertilizerPrediction.title", { defaultValue: "Fertilizer Recommendation" })}
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            {t("fertilizerPrediction.desc", {
              defaultValue:
                "Select your planned crop and test readings for Nitrogen, Phosphorus, and Potassium. Get precise fertilizer recommendations and land dosage calculations.",
            })}
          </p>
        </motion.div>

        {/* ── Input Form ── */}
        <motion.form
          onSubmit={handlePredict}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-3xl shadow-card p-6 sm:p-10 border border-stone-200 dark:border-stone-800 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-6">

            {/* Target Crop Select */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                {t("fertilizerPrediction.crop", { defaultValue: "Target Crop" })}
              </label>

              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <Sprout className="text-emerald-700 dark:text-emerald-400 mr-3 shrink-0" size={20} />

                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm sm:text-base cursor-pointer"
                >
                  <option value="" disabled className="bg-white dark:bg-stone-800 text-stone-400">
                    {t("fertilizerPrediction.selectCrop", { defaultValue: "Select crop to fertilize..." })}
                  </option>

                  {CROP_OPTIONS.map((crop) => (
                    <option
                      key={crop}
                      value={crop}
                      className="bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                    >
                      {t(`crops.${crop}`, { defaultValue: capitalize(crop) })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nitrogen (N) Input */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  {t("fertilizerPrediction.fieldN", { defaultValue: "Nitrogen (N)" })}
                </label>
                <span className="text-[11px] text-stone-400">Soil test level (kg/ha)</span>
              </div>

              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <Leaf className="text-emerald-700 dark:text-emerald-400 mr-3 shrink-0" size={18} />
                <input
                  type="number"
                  step="any"
                  name="N"
                  value={formData.N}
                  onChange={handleChange}
                  placeholder={t("fertilizerPrediction.placeholderN", { defaultValue: "e.g. 40" })}
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm sm:text-base placeholder:font-normal placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Phosphorus (P) Input */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  {t("fertilizerPrediction.fieldP", { defaultValue: "Phosphorus (P)" })}
                </label>
                <span className="text-[11px] text-stone-400">Soil test level (kg/ha)</span>
              </div>

              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <FlaskConical className="text-amber-600 dark:text-amber-400 mr-3 shrink-0" size={18} />
                <input
                  type="number"
                  step="any"
                  name="P"
                  value={formData.P}
                  onChange={handleChange}
                  placeholder={t("fertilizerPrediction.placeholderP", { defaultValue: "e.g. 50" })}
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm sm:text-base placeholder:font-normal placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Potassium (K) Input */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  {t("fertilizerPrediction.fieldK", { defaultValue: "Potassium (K)" })}
                </label>
                <span className="text-[11px] text-stone-400">Soil test level (kg/ha)</span>
              </div>

              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                <Sprout className="text-sky-600 dark:text-sky-400 mr-3 shrink-0" size={18} />
                <input
                  type="number"
                  step="any"
                  name="K"
                  value={formData.K}
                  onChange={handleChange}
                  placeholder={t("fertilizerPrediction.placeholderK", { defaultValue: "e.g. 50" })}
                  required
                  className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm sm:text-base placeholder:font-normal placeholder:text-stone-400"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Nutrient optimization designed to reduce fertilizer wastage & expenditure
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[260px] bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t("fertilizerPrediction.analyzing", { defaultValue: "AI is analyzing..." })}</span>
                </>
              ) : (
                <>
                  <span>🧪 {t("fertilizerPrediction.btnPredict", { defaultValue: "Analyze Soil Nutrients" })}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* ── Results Section ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Condition Banner */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-white shadow-card relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-3.5 py-1.5 rounded-full inline-block mb-3">
                    Detected Soil Status
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black capitalize tracking-tight text-white">
                    {result.condition ? result.condition.replace(/_/g, " ") : "Soil Profile Calibrated"}
                  </h2>
                  <p className="text-emerald-100/80 text-sm mt-2 max-w-xl">
                    Diagnosed against nutrient threshold curves for {formData.crop}.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 lg:w-80 shrink-0">
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-emerald-200">
                      {t("fertilizerPrediction.confidence", { defaultValue: "Analysis Certainty" })}
                    </span>
                    <span className="text-2xl font-black text-white">{result.confidence}%</span>
                  </div>

                  <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual NPK Balance Cards */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                <span>📊</span>
                <span>{t("fertilizerPrediction.npkComparison", { defaultValue: "NPK Nutrient Comparison" })}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                Comparing your tested field levels with optimal benchmark ranges.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Nitrogen (N)",
                    user: result.input_npk.N,
                    ideal: result.ideal_npk.N,
                    color: "bg-emerald-600",
                    text: "text-emerald-700 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/40",
                  },
                  {
                    name: "Phosphorus (P)",
                    user: result.input_npk.P,
                    ideal: result.ideal_npk.P,
                    color: "bg-amber-600",
                    text: "text-amber-700 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/40",
                  },
                  {
                    name: "Potassium (K)",
                    user: result.input_npk.K,
                    ideal: result.ideal_npk.K,
                    color: "bg-sky-600",
                    text: "text-sky-700 dark:text-sky-400",
                    bg: "bg-sky-50 dark:bg-sky-950/40",
                  },
                ].map((item, i) => {
                  const maxVal = Math.max(item.user, item.ideal, 100);
                  const userPct = Math.min(100, Math.round((item.user / maxVal) * 100));
                  const idealPct = Math.min(100, Math.round((item.ideal / maxVal) * 100));

                  return (
                    <div key={i} className={`p-5 rounded-2xl ${item.bg} border border-stone-200/60 dark:border-stone-800 space-y-4`}>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-stone-900 dark:text-white">{item.name}</span>
                        <span className={`text-xs font-bold ${item.text}`}>
                          {item.user < item.ideal ? "Deficit" : item.user > item.ideal ? "Surplus" : "Optimal"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-stone-600 dark:text-stone-300">
                            <span>Your Soil</span>
                            <span className="font-bold">{item.user} kg/ha</span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${userPct}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
                            <span>Ideal Target</span>
                            <span className="font-bold">{item.ideal} kg/ha</span>
                          </div>
                          <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-700/60 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-400 dark:bg-stone-500 rounded-full" style={{ width: `${idealPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Products: Chemical vs. Organic */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mb-1 flex items-center gap-2">
                  <span>🧪</span>
                  <span>{t("fertilizerPrediction.recFertilizer", { defaultValue: "Recommended Fertilizer Options" })}</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select between immediate conventional intervention or natural soil enrichment.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Chemical Option */}
                <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/60 relative">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                    {t("fertilizerPrediction.chemicalOpt", { defaultValue: "Conventional / Chemical Option" })}
                  </span>
                  <h4 className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                    {result.chemical_fertilizer}
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-2">
                    Fast-acting formulation to correct current soil deficiencies before crop development stages.
                  </p>
                </div>

                {/* Organic Alternative */}
                <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/60 relative">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Recycle size={14} />
                    {t("fertilizerPrediction.organicAlt", { defaultValue: "Organic Alternative" })}
                  </span>
                  <h4 className="text-2xl font-black text-amber-950 dark:text-amber-100">
                    {result.organic_alternative}
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-2">
                    Improves long-term soil microbiome, water retention capacity, and organic carbon content.
                  </p>
                </div>
              </div>

              {/* Exact Land Area Dosage Calculator */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <div>
                  <h4 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
                    <Ruler size={18} className="text-emerald-700 dark:text-emerald-400" />
                    <span>{t("fertilizerPrediction.quantityQuestion", { defaultValue: "Calculate Exact Quantity for Your Land" })}</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Enter your field size to receive exact bag / kilogram quantities.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1 flex items-center border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500">
                    <input
                      type="number"
                      step="any"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder={t("fertilizerPrediction.placeholderArea", { defaultValue: "Field size (hectares, e.g. 2.5)" })}
                      className="w-full outline-none bg-transparent text-stone-900 dark:text-white font-semibold text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useOrganic}
                      onChange={(e) => setUseOrganic(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                      {t("fertilizerPrediction.checkOrganic", { defaultValue: "Calculate Organic Dosage" })}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGetDosage}
                    disabled={dosageLoading}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-900/10 transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {dosageLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>{t("fertilizerPrediction.calculating", { defaultValue: "Calculating..." })}</span>
                      </>
                    ) : (
                      <span>{t("fertilizerPrediction.btnCalculate", { defaultValue: "Get Quantity Plan" })}</span>
                    )}
                  </button>
                </div>

                {/* Dosage Result Card */}
                {dosage && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 mt-4 space-y-3"
                  >
                    {dosage.note ? (
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                        ℹ️ {dosage.note}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                          Recommended Application Schedule for {landArea} ha:
                        </span>

                        {dosage.dosage_plan && dosage.dosage_plan.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200/60 dark:border-emerald-800/60"
                          >
                            <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                              {item.fertilizer}
                            </span>
                            <span className="text-base font-black text-emerald-800 dark:text-emerald-300">
                              {item.total_kg_needed} kg total
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}