import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  TrendingUp,
  FlaskConical,
  Droplets,
  ScanEye,
  BookOpen,
  Mic,
  CalendarDays,
  Landmark,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function ExploreFeatures() {
  const { t } = useTranslation();

  const liveTools = [
    {
      title: t("exploreFeatures.f1Title", { defaultValue: "Crop Recommendation" }),
      desc: t("exploreFeatures.f1Desc", { defaultValue: "AI-powered crop suggestions based on your soil, climate, and season." }),
      link: "/crop-prediction",
      icon: Sprout,
      model: "Random Forest Classifier",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      title: t("exploreFeatures.f3Title", { defaultValue: "Fertilizer Recommendation" }),
      desc: t("exploreFeatures.f3Desc", { defaultValue: "AI-optimized nutrient balancing for soil health." }),
      link: "/fertilizer-prediction",
      icon: FlaskConical,
      model: "Nutrient Calibration Model",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      title: t("exploreFeatures.f4Title", { defaultValue: "Smart Irrigation Advisor" }),
      desc: t("exploreFeatures.f4Desc", { defaultValue: "Hyper-local weather & moisture-based control." }),
      link: "/features/irrigation",
      icon: Droplets,
      model: "Moisture Threshold Engine",
      badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    },
    {
      title: t("exploreFeatures.f2Title", { defaultValue: "Market Price Prediction" }),
      desc: t("exploreFeatures.f2Desc", { defaultValue: "LSTM-powered forecasting for maximum harvest ROI." }),
      link: "/features/price-prediction",
      icon: TrendingUp,
      model: "LSTM Time-Series Network",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    },
  ];

  const roadmapTools = [
    {
      title: t("exploreFeatures.f5Title", { defaultValue: "Crop Health Monitoring" }),
      desc: t("exploreFeatures.f5Desc", { defaultValue: "Upload a leaf photo — AI detects diseases and pests instantly." }),
      link: "/features/health-monitor",
      icon: ScanEye,
      phase: "Field Testing",
    },
    {
      title: t("exploreFeatures.f6Title", { defaultValue: "Digital Farm Record" }),
      desc: t("exploreFeatures.f6Desc", { defaultValue: "Secure digital farm documentation and yield ledger." }),
      link: "/features/records",
      icon: BookOpen,
      phase: "Pilot Prototype",
    },
    {
      title: t("exploreFeatures.f7Title", { defaultValue: "AI Voice Assistant" }),
      desc: t("exploreFeatures.f7Desc", { defaultValue: "Multilingual, hands-free farming support in regional dialects." }),
      link: "/features/voice-assistant",
      icon: Mic,
      phase: "Model Training",
    },
    {
      title: t("exploreFeatures.f8Title", { defaultValue: "Crop Calendar & Task Planner" }),
      desc: t("exploreFeatures.f8Desc", { defaultValue: "AI-generated sowing, irrigation, and harvest schedule for your season." }),
      link: "/features/calendar",
      icon: CalendarDays,
      phase: "Field Validation",
    },
    {
      title: t("exploreFeatures.f9Title", { defaultValue: "Government Scheme Advisor" }),
      desc: t("exploreFeatures.f9Desc", { defaultValue: "Discover PM-KISAN, crop insurance, and state subsidies matched to your farm." }),
      link: "/features/schemes",
      icon: Landmark,
      phase: "Policy Mapping",
    },
  ];

  return (
    <section id="capabilities" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <Sparkles size={14} /> Platform Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mt-3 mb-4 tracking-tight">
          Precision Tools Built for the Field
        </h2>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          From soil nutrient diagnosis to commodity market timing, KrishiAI provides free, accessible intelligence for Indian farmers.
        </p>
      </div>

      {/* Part 1: Operational Core AI Advisory Tools */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white">
              Live Advisory Suite
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            Available Now
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-800/30 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                      <Icon size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 size={12} /> Live
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
                    {tool.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
                    {tool.model}
                  </span>
                  <Link
                    to={tool.link}
                    className="inline-flex items-center justify-between w-full font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 group"
                  >
                    <span>Launch Advisory</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Roadmap & Extension Services (Coming Soon) */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-600 dark:text-amber-400" />
            <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white">
              Roadmap & Agronomic Research
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1 rounded-full">
            Phase 2 Expansion
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-stone-50/80 dark:bg-stone-900/40 rounded-3xl p-6 border border-stone-200/70 dark:border-stone-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300">
                      <Icon size={20} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <Clock size={11} /> {tool.phase}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 dark:text-white mb-1.5">
                    {tool.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800">
                  <Link
                    to={tool.link}
                    className="inline-flex items-center justify-between w-full font-bold text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 group"
                  >
                    <span>Preview Roadmap</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}