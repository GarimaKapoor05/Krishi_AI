import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Sprout, Clock, ArrowLeft, ShieldCheck, Sparkles, BellRing, ArrowRight } from "lucide-react";

export default function ComingSoon({ feature = "This Module" }) {
  const location = useLocation();

  // Extract clean module title
  const cleanFeature = feature.replace(/^[^\w\s]+/, "").trim();

  // Module contextual descriptions
  const featureDescriptions = {
    "About Krishi AI": "Our mission, research backing, and partnerships with agricultural universities & NGOs.",
    "Careers": "Opportunities to join our agronomic data science and field engineering team.",
    "Press": "Coverage, media releases, and pilot program impact reports across rural districts.",
    "Contact Us": "Reach out directly to our agricultural field advisors, FPO leads, and technical team.",
    "Carbon Reports": "Automated estimation of soil carbon sequestration credits and regenerative farming audits.",
    "Climate Action": "Hyper-local adaptation strategies against unseasonal drought, frost, and extreme heatwaves.",
    "Partner Farms": "Demonstration pilot farms across Madhya Pradesh and neighboring agricultural belts.",
    "AI Disease Detection": "Computer-vision leaf pathology model diagnosing fungal, bacterial, and pest infestations.",
    "AI Voice Assistant": "Hands-free speech-to-speech agronomic advice in regional languages and local farmer dialects.",
    "Crop Health Monitoring": "Satellite NDVI vegetation indexing and drone multispectral health analytics.",
    "Digital Farm Record": "Digital farmer khata book to record seed purchases, fertilizer applications, and yields.",
    "Crop Calendar & Task Planner": "Season-long agronomic calendar with proactive alerts for sowing, weeding, and irrigation.",
    "Government Scheme Advisor": "Automated matching engine for PM-KISAN, crop insurance (PMFBY), and state machinery subsidies.",
  };

  const description =
    featureDescriptions[cleanFeature] ||
    "Our agronomic AI research team is actively developing and field-validating this module for smallholder farmers.";

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-200">
      <div className="max-w-2xl mx-auto w-full text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-stone-200 dark:border-stone-800 shadow-card space-y-6"
        >
          {/* Animated Sprout/Growth Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm mx-auto">
            <Sprout size={40} className="text-emerald-700 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full">
              <Sparkles size={14} /> Something Better Is Growing
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
              {feature}
            </h1>

            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed pt-2">
              {description}
            </p>
          </div>

          {/* Development Status Gauge */}
          <div className="w-full max-w-md mx-auto p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                Under Field Research & Validation
              </span>
              <span className="text-emerald-800 dark:text-emerald-400">Phase 2 Testing</span>
            </div>

            <div className="w-full h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
              />
            </div>

            <p className="text-[11px] text-stone-400 dark:text-stone-500 text-left">
              Calibrating models with university agronomic trial data before open release.
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-6 py-3.5 rounded-2xl font-bold text-sm transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-900/10 transition"
            >
              <span>Explore Live AI Tools</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}