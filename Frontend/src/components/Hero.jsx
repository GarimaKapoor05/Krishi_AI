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
} from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();

  const coreTools = [
    {
      title: "Crop Recommendation",
      titleKey: "modules.crop_recommendation",
      icon: Sprout,
      link: "/crop-prediction",
      color: "from-emerald-600 to-green-700",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-800 dark:text-emerald-300",
      desc: "Optimal seed choice for your soil",
    },
    {
      title: "Fertilizer Guidance",
      titleKey: "modules.fertilizer_advisor",
      icon: FlaskConical,
      link: "/fertilizer-prediction",
      color: "from-amber-600 to-yellow-700",
      bgLight: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-800 dark:text-amber-300",
      desc: "Custom NPK nutrient balance",
    },
    {
      title: "Smart Irrigation",
      titleKey: "modules.irrigation_advisor",
      icon: Droplets,
      link: "/features/irrigation",
      color: "from-sky-600 to-blue-700",
      bgLight: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-200 dark:border-sky-800",
      text: "text-sky-800 dark:text-sky-300",
      desc: "Watering schedule & soil moisture",
    },
    {
      title: "Market Forecast",
      titleKey: "modules.price_forecaster",
      icon: TrendingUp,
      link: "/features/price-prediction",
      color: "from-teal-600 to-emerald-700",
      bgLight: "bg-teal-50 dark:bg-teal-950/40",
      border: "border-teal-200 dark:border-teal-800",
      text: "text-teal-800 dark:text-teal-300",
      desc: "Tomorrow's mandi price trends",
    },
  ];

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-amber-50/20 to-transparent dark:from-emerald-950/20 dark:via-transparent pointer-events-none blur-3xl -z-10" />

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Heading & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold shadow-xs">
            <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>AI-Driven Precision Agriculture for Indian Farmers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
            Smart Farming Starts With{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Better Decisions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            KrishiAI brings intelligent agricultural recommendations to farmers, helping them make better decisions about crops, fertilizers, irrigation, and market opportunities.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white font-bold text-base shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all duration-300 group"
            >
              <span>Explore KrishiAI</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-emerald-800/20 dark:border-emerald-700/40 hover:border-emerald-800 dark:hover:border-emerald-500 bg-white/80 dark:bg-stone-900/80 text-stone-900 dark:text-stone-100 font-bold text-base transition-all duration-200 shadow-xs"
            >
              <span>Get Started Free</span>
            </Link>
          </div>

          {/* Assurance bullet tags */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              100% Free for Farmers
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              4 Regional Languages
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              Trained on Indian Soil Data
            </span>
          </div>
        </motion.div>

        {/* Right Column: 4 AI Tools Feature Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-stone-900 dark:text-white text-base">
                  Core AI Advisory Tools
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Ready to Use
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {coreTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={idx}
                    to={tool.link}
                    className={`group p-4 rounded-2xl ${tool.bgLight} border ${tool.border} hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Icon size={20} className={tool.text} />
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {t(tool.titleKey, { defaultValue: tool.title })}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-stone-200/40 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span>Try tool</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Soil Metric Bar */}
            <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Random Forest & LSTM Powered
              </span>
              <Link
                to="/dashboard"
                className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                View Live Demo →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}