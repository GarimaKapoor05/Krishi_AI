import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  UserPlus,
  FlaskConical,
  Sprout,
  Package,
  Droplets,
  ScanEye,
  TrendingUp,
  Truck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Workflow() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("workflow.step1Title", { defaultValue: "Create Your Farm Profile" }),
      desc: t("workflow.step1Desc", {
        defaultValue: "Register with your phone number. Add your land area, location, and soil type to get started.",
      }),
      icon: UserPlus,
      stage: "Onboarding",
    },
    {
      title: t("workflow.step2Title", { defaultValue: "Analyse Your Soil" }),
      desc: t("workflow.step2Desc", {
        defaultValue: "Enter your soil's N-P-K values and pH. Krishi AI calibrates every recommendation to your actual field conditions.",
      }),
      icon: FlaskConical,
      stage: "Diagnosis",
    },
    {
      title: t("workflow.step3Title", { defaultValue: "Get Your Crop Recommendation" }),
      desc: t("workflow.step3Desc", {
        defaultValue: "Our AI suggests the best crop for your soil, climate, and season — with a confidence score and expected yield.",
      }),
      icon: Sprout,
      stage: "Seed Selection",
    },
    {
      title: t("workflow.step4Title", { defaultValue: "Plan Your Fertilizer" }),
      desc: t("workflow.step4Desc", {
        defaultValue: "Know exactly which fertilizer to use, how much, and whether to go chemical or organic — calculated for your field size.",
      }),
      icon: Package,
      stage: "Nutrient Plan",
    },
    {
      title: t("workflow.step5Title", { defaultValue: "Schedule Irrigation" }),
      desc: t("workflow.step5Desc", {
        defaultValue: "Get a watering schedule based on your crop's needs, local weather, and soil moisture levels.",
      }),
      icon: Droplets,
      stage: "Water Optimization",
    },
    {
      title: t("workflow.step6Title", { defaultValue: "Monitor Crop Health" }),
      desc: t("workflow.step6Desc", {
        defaultValue: "Upload a photo of your crop or leaf. AI detects diseases, pests, and nutrient deficiencies early — before they spread.",
      }),
      icon: ScanEye,
      stage: "Protection",
    },
    {
      title: t("workflow.step7Title", { defaultValue: "Track Market Prices" }),
      desc: t("workflow.step7Desc", {
        defaultValue: "See today's mandi prices and AI forecasts for the next 24 hours. Know the best time to sell before you leave the farm.",
      }),
      icon: TrendingUp,
      stage: "Mandi Timing",
    },
    {
      title: t("workflow.step8Title", { defaultValue: "Sell & Track Your Harvest" }),
      desc: t("workflow.step8Desc", {
        defaultValue: "Connect directly with buyers, FPOs, and mandis. Track your shipment and get paid — no middlemen.",
      }),
      icon: Truck,
      stage: "Harvest Realization",
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto transition-colors duration-300">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <Sparkles size={14} /> End-to-End Farm Lifecycle
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mt-3 mb-4 tracking-tight">
          {t("workflow.title", { defaultValue: "The Intelligent Farm Journey" })}
        </h2>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          {t("workflow.subtitle", {
            defaultValue: "From soil analysis to market sale — Krishi AI guides every step of your farming season.",
          })}
        </p>
      </div>

      {/* Timeline Layout */}
      <div className="relative">
        {/* Continuous Center Timeline Line (Desktop: center, Mobile: left-6) */}
        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-600 via-teal-500 to-emerald-200 dark:from-emerald-500 dark:via-teal-700 dark:to-emerald-900 -translate-x-1/2 hidden xs:block" />

        <div className="space-y-8 sm:space-y-12">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`relative flex items-start md:items-center ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                } gap-4 sm:gap-8`}
              >
                {/* Node Milestone Circle */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-11 h-11 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-600 dark:border-emerald-400 flex items-center justify-center font-extrabold text-xs text-emerald-800 dark:text-emerald-300 shadow-md z-10 shrink-0 hidden xs:flex">
                  <span>{index + 1}</span>
                </div>

                {/* Content Card (Half width on desktop, full width on mobile) */}
                <div
                  className={`w-full md:w-1/2 pl-0 xs:pl-16 md:pl-0 ${
                    isLeft ? "md:pr-12 lg:pr-16 md:text-right" : "md:pl-12 lg:pl-16 md:text-left"
                  }`}
                >
                  <div
                    className={`bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-card-hover transition-all duration-300 group ${
                      isLeft ? "md:items-end" : "md:items-start"
                    }`}
                  >
                    {/* Header with Stage Badge & Icon */}
                    <div
                      className={`flex items-center gap-3 mb-3 ${
                        isLeft ? "md:flex-row-reverse" : "md:flex-row"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={18} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {step.stage} • Step 0{index + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl text-stone-900 dark:text-white mb-2 tracking-tight group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}