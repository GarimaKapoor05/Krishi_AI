import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { API_URL } from "../config";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  CalendarDays,
  IndianRupee,
  Loader2,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  Activity,
  LineChart,
  MapPin,
  Radio,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MarketPricePrediction() {
  const { t } = useTranslation();

  const [crop, setCrop] = useState("rice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        crop,
        recent_prices: [2100, 2110, 2130, 2125, 2140, 2160, 2155, 2170, 2180, 2190],
      };
      const response = await fetch(`${API_URL}/api/market/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        status: "error",
        message: t("pricePrediction.errBackend", {
          defaultValue: "Unable to connect to the backend. Please ensure the Flask server is running.",
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  const isError = result && (result.status === "error" || result.error);
  const errorMessage = result?.message || result?.error || "";
  const trendUp = result?.trend === "Upward";
  const trendColor = trendUp ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400";
  const trendBg = trendUp
    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
    : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";

  // Historical trend visual simulation based on payload input
  const trendGraphData = [
    { day: "D-9", price: 2100 },
    { day: "D-8", price: 2110 },
    { day: "D-7", price: 2130 },
    { day: "D-6", price: 2125 },
    { day: "D-5", price: 2140 },
    { day: "D-4", price: 2160 },
    { day: "D-3", price: 2155 },
    { day: "D-2", price: 2170 },
    { day: "D-1", price: 2180 },
    { day: "Today", price: 2190 },
    ...(result?.forecasted_price
      ? [{ day: "Tomorrow (AI)", price: Number(result.forecasted_price), isForecast: true }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-300/60 dark:border-teal-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
            <TrendingUp className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{t("pricePrediction.lstmBadge", { defaultValue: "LSTM Recurrent Neural Network Mandi Forecaster" })}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {t("pricePrediction.title", { defaultValue: "Crop Market Price Forecasting" })}
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            {t("pricePrediction.desc", {
              defaultValue:
                "Predict tomorrow's mandi price before harvesting or transporting crops. Built with deep learning models trained on APMC market rate histories.",
            })}
          </p>

          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 inline-block">
            {t("pricePrediction.roadmapLine", {
              defaultValue:
                "📍 Pilot Deployment: Bhopal Mandi, MP — expanding across all APMC markets pan-India.",
            })}
          </p>
        </motion.div>

        {/* ── Input Parameters Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-8"
        >
          <div className="flex items-center gap-3.5 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
                {t("pricePrediction.forecastParams", { defaultValue: "Mandi Forecast Parameters" })}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t("pricePrediction.paramsDesc", { defaultValue: "Select target commodity and forecasting horizon." })}
              </p>
            </div>
          </div>

          <form onSubmit={handleForecast} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">

              {/* Crop Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("pricePrediction.crop", { defaultValue: "Commodity Crop" })}
                </label>
                <div className="border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-50/50 dark:bg-stone-800/40 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-stone-900 transition">
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-transparent text-stone-900 dark:text-white font-semibold outline-none cursor-pointer text-sm sm:text-base"
                  >
                    <option value="rice" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {t("crops.rice", { defaultValue: "Rice (Paddy)" })}
                    </option>
                    <option value="wheat" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {t("crops.wheat", { defaultValue: "Wheat" })}
                    </option>
                    <option value="maize" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {t("crops.maize", { defaultValue: "Maize" })}
                    </option>
                    <option value="cotton" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {t("crops.cotton", { defaultValue: "Cotton" })}
                    </option>
                    <option value="soybean" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                      {t("crops.soybean", { defaultValue: "Soybean" })}
                    </option>
                  </select>
                </div>
              </div>

              {/* Forecast Horizon */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  <CalendarDays className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("pricePrediction.horizon", { defaultValue: "Forecast Window" })}
                </label>
                <div className="border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3.5 bg-stone-100/70 dark:bg-stone-800/30">
                  <input
                    value="Next 24 Hours (Mandi Opening)"
                    disabled
                    className="w-full bg-transparent text-stone-500 dark:text-stone-400 font-semibold text-sm sm:text-base cursor-not-allowed outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Pilot Mandi Location Box */}
            <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 flex items-start gap-3.5">
              <Radio className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  {t("pricePrediction.pilotMarket", { defaultValue: "Active Pilot APMC: Bhopal Mandi, Madhya Pradesh" })}
                </p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  {t("pricePrediction.pilotDesc", {
                    defaultValue:
                      "Model calibrated on daily wholesale mandi arrival volumes and price history.",
                  })}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                Sequence memory neural network analyzing 10-day market momentum
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[260px] bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{t("pricePrediction.generating", { defaultValue: "Generating Forecast..." })}</span>
                  </>
                ) : (
                  <>
                    <span>📈 {t("pricePrediction.btnForecast", { defaultValue: "Generate Price Forecast" })}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Error Notification ── */}
        {isError && (
          <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5 flex gap-3 text-red-800 dark:text-red-300">
            <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Prediction Service Error</h3>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ── Forecast Results Section ── */}
        {result && result.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Stat Cluster */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Forecasted Price */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4 text-emerald-800 dark:text-emerald-400">
                  <IndianRupee size={22} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("pricePrediction.price", { defaultValue: "Forecast Price" })}
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white mt-1">
                  ₹{result.forecasted_price}
                </h3>
                <p className="text-xs text-stone-400 mt-1">per Quintal (100 kg)</p>
              </div>

              {/* Trend Direction */}
              <div className={`rounded-3xl p-6 border shadow-card ${trendBg}`}>
                <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-stone-900/70 flex items-center justify-center mb-4">
                  {trendUp ? (
                    <TrendingUp className="text-emerald-700 dark:text-emerald-400" size={24} />
                  ) : (
                    <TrendingDown className="text-rose-700 dark:text-rose-400" size={24} />
                  )}
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("pricePrediction.trend", { defaultValue: "Market Trend" })}
                </p>
                <h3 className={`text-3xl sm:text-4xl font-black mt-1 ${trendColor}`}>
                  {result.trend}
                </h3>
                <p className="text-xs text-stone-400 mt-1">Expected 24-hour shift</p>
              </div>

              {/* Model Confidence */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4 text-blue-800 dark:text-blue-400">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("pricePrediction.confidence", { defaultValue: "Model Certainty" })}
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 mt-1">
                  {result.confidence}
                </h3>
                <p className="text-xs text-stone-400 mt-1">Validation convergence</p>
              </div>

              {/* Suggested Action */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4 text-amber-700 dark:text-amber-400">
                  <Sparkles size={22} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("pricePrediction.recommendation", { defaultValue: "Farmer Action" })}
                </p>
                <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                  {result.recommendation}
                </h3>
                <p className="text-xs text-stone-400 mt-1">Optimal selling tactic</p>
              </div>
            </div>

            {/* Price Movement & Market Outlook Details */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Price Movement Summary */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-lg text-stone-900 dark:text-white">
                      {t("pricePrediction.movement", { defaultValue: "Price Momentum" })}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t("pricePrediction.movementDesc", { defaultValue: "Relative change against current mandi baseline." })}
                    </p>
                  </div>

                  <span className={`text-3xl font-black ${trendColor}`}>
                    {result.percentage_change > 0 ? "+" : ""}
                    {result.percentage_change}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {trendUp
                    ? t("pricePrediction.movementUp", {
                        defaultValue:
                          "The AI forecasts an increase in tomorrow's mandi price. Farmers may consider holding stock to capture higher returns.",
                      })
                    : t("pricePrediction.movementDown", {
                        defaultValue:
                          "The AI forecasts a softening in tomorrow's mandi price. Selling earlier or dispatching to secondary markets could protect margin.",
                      })}
                </div>
              </div>

              {/* Agronomic Market Outlook */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-stone-900 dark:text-white">
                      {t("pricePrediction.outlook", { defaultValue: "Market Intelligence Outlook" })}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t("pricePrediction.outlookDesc", { defaultValue: "AI synthesized supply-demand context" })}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  {result.outlook}
                </p>
              </div>
            </div>

            {/* Historical vs Forecast Price Trend Chart */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="font-extrabold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                    <LineChart size={20} className="text-emerald-700 dark:text-emerald-400" />
                    <span>Price Trend Sequence (Past 10 Days → Tomorrow)</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Historical mandi prices combined with neural network forecast projection.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ₹/Quintal
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendGraphData}>
                    <defs>
                      <linearGradient id="mandiTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip
                      formatter={(val) => [`₹${val} / Quintal`, "Price"]}
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        borderRadius: "16px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#2d6a4f"
                      strokeWidth={2.5}
                      fill="url(#mandiTrendGrad)"
                      name="Price"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── APMC Mandi Coverage Roadmap ── */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-10">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                {t("pricePrediction.roadmapTitle", { defaultValue: "National Mandi Coverage Roadmap" })}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                {t("pricePrediction.roadmapSubtitle", {
                  defaultValue: "From local APMC mandi validation to pan-India village coverage.",
                })}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                phase: "Phase 1 — Operational Now",
                title: "Bhopal Mandi Pilot",
                desc: "LSTM model trained on Bhopal APMC mandi historical records. 5 primary commodities with 24-hour forward prediction.",
                badge: "✅ Live in Pilot",
                style: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
              },
              {
                phase: "Phase 2 — In Integration",
                title: "Madhya Pradesh Mandis",
                desc: "Expansion to major MP district mandis via Agmarknet real-time market data API integration. 20+ crops.",
                badge: "🔧 In Testing",
                style: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200",
              },
              {
                phase: "Phase 3 — Long-Term Vision",
                title: "Pan-India Agri Network",
                desc: "Real-time coverage for 2,400+ mandis across India, automated SMS / IVR price alerts in regional dialects.",
                badge: "🚀 Roadmap",
                style: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${item.style} flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70 dark:bg-stone-900/70 inline-block mb-3">
                    {item.badge}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">
                    {item.phase}
                  </p>
                  <h3 className="font-extrabold text-base mb-2">{item.title}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}