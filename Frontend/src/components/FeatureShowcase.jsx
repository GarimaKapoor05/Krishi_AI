import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function FeatureShowcase() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("featureShowcase.f1Title", { defaultValue: "Smart Crop Advisor" }),
      desc: t("featureShowcase.f1Desc", {
        defaultValue: "Matches your farm's unique soil profile with real-time global weather data to recommend the most profitable crop.",
      }),
      status: "live",
      icon: Sprout,
      link: "/crop-prediction",
      stat: "94.8% Accuracy",
      statLabel: "Across 22 crop classes",
      tag: "Soil-Climate Matcher",
    },
    {
      title: t("featureShowcase.f2Title", { defaultValue: "Market Price Forecaster" }),
      desc: t("featureShowcase.f2Desc", {
        defaultValue: "Utilizes historical price trends and seasonal data to tell you the perfect time to sell your harvest for maximum profit.",
      }),
      status: "live",
      icon: TrendingUp,
      link: "/features/price-prediction",
      stat: "24h to 7d Trend",
      statLabel: "APMC Mandi Projections",
      tag: "LSTM Neural Net",
    },
    {
      title: t("featureShowcase.f3Title", { defaultValue: "Logistics Optimizer" }),
      desc: t("featureShowcase.f3Desc", {
        defaultValue: "Connects your farm to the closest distribution centers, calculating the lowest transport cost and shortest delivery routes.",
      }),
      status: "coming",
      icon: Truck,
      link: "/partner-farms",
      stat: "Under Research",
      statLabel: "FPO Cold Chain Mapping",
      tag: "FPO Distribution Engine",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-stone-50/70 dark:bg-stone-900/50 px-4 sm:px-6 lg:px-8 transition-colors border-y border-stone-200/60 dark:border-stone-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles size={14} /> Core Intelligence Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mt-3 mb-4 tracking-tight">
            {t("featureShowcase.title", { defaultValue: "Intelligence-Driven Farming" })}
          </h2>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Engineered specifically for smallholder farms to transform raw soil and market parameters into clear, timely farming actions.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isLive = f.status === "live";

            return (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-stone-900 p-7 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon and Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-xs">
                      <Icon size={24} />
                    </div>

                    {isLive ? (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t("featureShowcase.badgeLive", { defaultValue: "Live Tool" })}
                      </span>
                    ) : (
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock size={12} />
                        {t("featureShowcase.badgeComing", { defaultValue: "In Research" })}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    {f.tag}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-3 tracking-tight">
                    {f.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                    {f.desc}
                  </p>
                </div>

                {/* Bottom Impact Metric & Action */}
                <div className="pt-5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                      {f.stat}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {f.statLabel}
                    </div>
                  </div>

                  <Link
                    to={f.link}
                    className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold ${
                      isLive
                        ? "text-emerald-800 dark:text-emerald-300 hover:text-emerald-900"
                        : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                    } group`}
                  >
                    <span>{isLive ? "Open Tool" : "Roadmap"}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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