import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Sparkles, BarChart3, TrendingUp, Info } from "lucide-react";

export default function AnalyticsDashboard() {
  const { t } = useTranslation();

  const priceData = [
    { month: t("analytics.jan", { defaultValue: "Jan" }), price: 4000 },
    { month: t("analytics.feb", { defaultValue: "Feb" }), price: 3200 },
    { month: t("analytics.mar", { defaultValue: "Mar" }), price: 5100 },
    { month: t("analytics.apr", { defaultValue: "Apr" }), price: 4200 },
    { month: t("analytics.may", { defaultValue: "May" }), price: 6890 },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3">
            <BarChart3 size={14} /> Mandi Trend Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {t("analytics.title", { defaultValue: "Live Analytics & Forecasting" })}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-2 max-w-xl">
            {t("analytics.note", {
              defaultValue: "Simulated demonstration calibrated with historical Agmarknet mandi price series.",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-200/70 dark:border-amber-900/50 flex items-center gap-1.5">
            <Sparkles size={13} />
            {t("analytics.badgeSimulated", { defaultValue: "Demo Feed" })}
          </span>
        </div>
      </div>

      {/* Grid of Two Responsive Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Chart 1: LSTM Price Forecasting */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-card transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                LSTM Neural Network
              </span>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                {t("analytics.chart1Title", { defaultValue: "Price Trend Forecast (Wheat)" })}
              </h3>
            </div>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl">
              ₹ / Quintal
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
            {t("analytics.chart1Sub", {
              defaultValue: "Simulated ₹/quintal projections based on mandi seasonality.",
            })}
          </p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`₹${val}`, "Forecast Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Profit Projection */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-card transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-0.5">
                Economic Model
              </span>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                {t("analytics.chart2Title", { defaultValue: "Yield vs. Net Realization" })}
              </h3>
            </div>
            <span className="text-xs text-teal-800 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-xl">
              Monthly Index
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
            {t("analytics.chart2Sub", {
              defaultValue: "Simulated crop value index comparing harvest timing.",
            })}
          </p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`₹${val}`, "Net Realization"]}
                />
                <Bar dataKey="price" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}