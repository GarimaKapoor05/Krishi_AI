import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  FlaskConical,
  Droplets,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Activity,
  Layers,
  Thermometer,
} from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();

  const coreTools = [
    {
      title: "Crop Recommendation",
      titleKey: "modules.crop_recommendation",
      icon: Sprout,
      link: "/crop-prediction",
      accent: "text-emerald-700 dark:text-emerald-400",
      bgHover: "hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30",
      badge: "Random Forest",
      desc: "Optimal seed selection calibrated to soil NPK & climate.",
    },
    {
      title: "Fertilizer Guidance",
      titleKey: "modules.fertilizer_advisor",
      icon: FlaskConical,
      link: "/fertilizer-prediction",
      accent: "text-amber-700 dark:text-amber-400",
      bgHover: "hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
      badge: "Nutrient Engine",
      desc: "Tailored N-P-K dosage calculations for target yields.",
    },
    {
      title: "Smart Irrigation",
      titleKey: "modules.irrigation_advisor",
      icon: Droplets,
      link: "/features/irrigation",
      accent: "text-sky-700 dark:text-sky-400",
      bgHover: "hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/30",
      badge: "Moisture AI",
      desc: "Soil moisture thresholds & weather-aware watering schedule.",
    },
    {
      title: "Market Price Forecast",
      titleKey: "modules.price_forecaster",
      icon: TrendingUp,
      link: "/features/price-prediction",
      accent: "text-teal-700 dark:text-teal-400",
      bgHover: "hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30",
      badge: "LSTM Deep Learning",
      desc: "Historical mandi trend projections for peak profit timing.",
    },
  ];

  return (
    <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Subtle organic background mesh gradient */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent dark:from-emerald-950/25 dark:via-transparent pointer-events-none blur-3xl -z-10" />

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Heading & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/70 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold shadow-xs">
            <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>AI-Driven Precision Agriculture for Indian Smallholders</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.12]">
            Data-Driven Farming,{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Simplified for Every Kisan.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            KrishiAI combines hyper-local soil chemistry, weather dynamics, and APMC mandi forecasts to deliver actionable farming guidance — reducing input costs and maximizing harvest income.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all duration-300 group"
            >
              <span>Explore Live Advisory</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/crop-prediction"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl border-2 border-emerald-800/20 dark:border-emerald-700/40 hover:border-emerald-800 dark:hover:border-emerald-500 bg-white/80 dark:bg-stone-900/80 text-stone-900 dark:text-stone-100 font-bold text-sm sm:text-base transition-all duration-200 shadow-xs"
            >
              <span>Try Crop Recommendation</span>
            </Link>
          </div>

          {/* Social Proof & Trust Pillars */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              100% Free Public Access
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              English, हिन्दी, தமிழ், اردو
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              Calibrated for Indian Agro-Climates
            </span>
          </div>
        </motion.div>

        {/* Right Column: High-Fidelity Agri-Intelligence Field Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="lg:col-span-5"
        >
          <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card space-y-5">

            {/* Field Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-600" />
                  Agro-Intelligence Terminal
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Live Simulation
              </span>
            </div>

            {/* Simulated Live Field Metric Strip */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Soil N-P-K
                </span>
                <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5">
                  140:50:180
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Optimal</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Moisture
                </span>
                <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5">
                  64%
                </span>
                <span className="text-[10px] text-sky-600 font-semibold">Adequate</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Mandi Trend
                </span>
                <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5">
                  +5.8%
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Bullish</span>
              </div>
            </div>

            {/* Core Operational Tools Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 px-1">
                <span>Operational Advisory Models</span>
                <span className="text-emerald-700 dark:text-emerald-400">4 Active Tools</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {coreTools.map((tool, idx) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={idx}
                      to={tool.link}
                      className={`group p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/80 dark:border-stone-800 ${tool.bgHover} transition-all duration-200 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-900 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon size={16} className={tool.accent} />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {tool.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {t(tool.titleKey, { defaultValue: tool.title })}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-tight">
                          {tool.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-1.5 border-t border-stone-200/40 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        <span>Launch</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Link to Master Dashboard */}
            <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                Random Forest & LSTM Architecture
              </span>
              <Link
                to="/dashboard"
                className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Full Farm View</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}