import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sprout,
  FlaskConical,
  Droplets,
  Bug,
  TrendingUp,
  BookOpen,
  Mic,
  CloudRain,
  Thermometer,
  Wind,
  Bell,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
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
import { useTranslation } from "react-i18next";

// ── Sample Mandi trend data (explicitly labeled as demo) ──────────────────────────
const priceData = [
  { month: "Jan", wheat: 2100, rice: 3200 },
  { month: "Feb", wheat: 2400, rice: 3000 },
  { month: "Mar", wheat: 2200, rice: 3800 },
  { month: "Apr", wheat: 2900, rice: 3500 },
  { month: "May", wheat: 3100, rice: 4100 },
  { month: "Jun", wheat: 2800, rice: 3900 },
];

const modules = [
  {
    titleKey: "crop_recommendation",
    descKey: "crop_recommendation_desc",
    icon: Sprout,
    link: "/crop-prediction",
    status: "live",
    badge: "AI Recommended",
    color: "from-emerald-700 to-green-800",
  },
  {
    titleKey: "fertilizer_advisor",
    descKey: "fertilizer_advisor_desc",
    icon: FlaskConical,
    link: "/fertilizer-prediction",
    status: "live",
    badge: "NPK Balance",
    color: "from-amber-700 to-yellow-800",
  },
  {
    titleKey: "irrigation_advisor",
    descKey: "irrigation_advisor_desc",
    icon: Droplets,
    link: "/features/irrigation",
    status: "live",
    badge: "Water Schedule",
    color: "from-sky-700 to-blue-800",
  },
  {
    titleKey: "price_forecaster",
    descKey: "price_forecaster_desc",
    icon: TrendingUp,
    link: "/features/price-prediction",
    status: "live",
    badge: "LSTM 24h",
    color: "from-teal-700 to-emerald-800",
  },
  {
    titleKey: "disease_detection",
    descKey: "disease_detection_desc",
    icon: Bug,
    link: "/disease-ai",
    status: "coming",
    badge: "Beta",
  },
  {
    titleKey: "farm_records",
    descKey: "farm_records_desc",
    icon: BookOpen,
    link: "/features/records",
    status: "coming",
    badge: "Digital Khata",
  },
  {
    titleKey: "voice_assistant",
    descKey: "voice_assistant_desc",
    icon: Mic,
    link: "/features/voice-assistant",
    status: "coming",
    badge: "Voice AI",
  },
];

const alerts = [
  {
    type: "warning",
    messageKey: "alert_soil_moisture",
    timeKey: "time_2_hours_ago",
  },
  {
    type: "info",
    messageKey: "alert_rice_prices",
    timeKey: "time_5_hours_ago",
  },
  {
    type: "success",
    messageKey: "alert_fertilizer_window",
    timeKey: "time_yesterday",
  },
];

const alertStyles = {
  warning:
    "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200",
  info: "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200",
  success:
    "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
};

const alertIcons = {
  warning: "⚠️",
  info: "ℹ️",
  success: "✅",
};

const stats = [
  { labelKey: "farmers_to_reach", value: "120K+", subtitle: "Target Impact" },
  { labelKey: "water_reduction_target", value: "38%", subtitle: "Water Conserved" },
  { labelKey: "co2_offset_goal", value: "2.4M t", subtitle: "Emission Offset" },
  { labelKey: "detection_accuracy", value: "94%", subtitle: "Model Certainty" },
];

export default function Dashboard() {
  const { t } = useTranslation();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Welcome Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3 py-1 rounded-full mb-3">
              <Sparkles size={14} />
              Agricultural Intelligence Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
              {t("dashboard.good_morning")} 👋
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2 text-sm">
              <Calendar size={15} />
              <span>{today}</span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span>Let's make today's farming decisions smarter.</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-xs flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600" />
              <span>{t("dashboard.demo_view")}</span>
            </span>

            <Link
              to="/user-dashboard"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/10 transition"
            >
              <span>Farmer Profile</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* ── Weather & Real-time Field Advisories ── */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Weather card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-7"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <CloudRain size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {t("dashboard.weather")}
                  </h2>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    Bhopal Region • Live IMD Simulation
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full font-bold">
                Optimal
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              {t("dashboard.weather_note")}
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { icon: Thermometer, label: "Temperature", value: "28°C", sub: "Warm & Clear", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                { icon: Droplets, label: "Humidity", value: "72%", sub: "Healthy level", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { icon: CloudRain, label: "Rainfall", value: "4 mm", sub: "Light expected", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
                { icon: Wind, label: "Wind Speed", value: "14 km/h", sub: "Gentle breeze", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
              ].map((w, i) => {
                const Icon = w.icon;
                return (
                  <div key={i} className={`p-4 rounded-2xl ${w.bg} border border-stone-200/40 dark:border-stone-800/60`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">{w.label}</span>
                      <Icon size={16} className={w.color} />
                    </div>
                    <p className={`text-xl font-extrabold ${w.color}`}>{w.value}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{w.sub}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Smart Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-stone-900 dark:text-white">
                      {t("dashboard.alerts")}
                    </h2>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500">
                      Real-time agronomic triggers for field management
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 px-2.5 py-1 rounded-full font-bold">
                  3 Active
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`border-l-4 px-4 py-3.5 rounded-2xl text-sm ${alertStyles[alert.type]} shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base select-none">{alertIcons[alert.type]}</span>
                        <p className="font-medium text-xs sm:text-sm leading-snug">
                          {t(alert.messageKey, { defaultValue: "Field conditions verified for upcoming cycle." })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold opacity-60 shrink-0">
                        {t(alert.timeKey, { defaultValue: "Recent" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Alerts personalized to your soil readings
              </span>
              <Link to="/features/irrigation" className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                View Irrigation Status →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── AI Tools Grid (4 Core + 3 Roadmap) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <span>🌾</span>
                <span>{t("dashboard.modules")}</span>
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
                Select an intelligent advisor to run an instant analysis for your field.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 self-start sm:self-auto">
              4 Live AI Models Ready
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Link to={mod.link} key={i}>
                  <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 hover:shadow-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon size={24} className="text-emerald-700 dark:text-emerald-400" />
                        </div>
                        {mod.status === "live" ? (
                          <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                            ✅ {t("common.live")}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-full">
                            🔧 {t("common.coming_soon")}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-stone-900 dark:text-white text-base mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {t(`modules.${mod.titleKey}`, { defaultValue: mod.titleKey })}
                      </h3>

                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        {t(`modules.${mod.descKey}`, { defaultValue: "Intelligent farming advisor." })}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      <span>{t("common.open", { defaultValue: "Launch tool" })}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* ── Price Trend Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <BarChart2 size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-stone-900 dark:text-white">
                  {t("dashboard.price_trends")}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {t("dashboard.price_note")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                📊 {t("dashboard.simulated_data")}
              </span>
              <Link
                to="/features/price-prediction"
                className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline px-2 py-1"
              >
                Forecast Tomorrow →
              </Link>
            </div>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="riceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`₹${val} / Quintal`, ""]}
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderRadius: "16px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="wheat"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wheatGrad)"
                  name="Wheat (Mandi avg)"
                />
                <Area
                  type="monotone"
                  dataKey="rice"
                  stroke="#2d6a4f"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#riceGrad)"
                  name="Rice (Paddy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-8 mt-5 justify-center text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-600 inline-block" />
              Wheat Mandi Price (₹/Quintal)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 inline-block" />
              Rice (Paddy) Mandi Price (₹/Quintal)
            </span>
          </div>
        </motion.div>

        {/* ── Impact Banner (NGO Presentation Ready) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-white shadow-card relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <p className="text-center text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">
            🎯 {t("dashboard.goals")}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
            {stats.map((stat, i) => (
              <div key={i} className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-emerald-300 mb-1">
                  {stat.value}
                </div>
                <div className="text-white font-extrabold text-sm mb-1">
                  {stat.subtitle}
                </div>
                <div className="text-emerald-200/70 text-xs font-medium">
                  {t(`stats.${stat.labelKey}`, { defaultValue: "Measurable Impact" })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}