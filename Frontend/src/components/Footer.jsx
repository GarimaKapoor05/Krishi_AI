import { Sprout, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("footer.product", { defaultValue: "Core AI Advisors" }),
      links: [
        { label: t("nav.crop_prediction", { defaultValue: "Crop Recommendation" }), to: "/crop-prediction" },
        { label: t("exploreFeatures.f2Title", { defaultValue: "Mandi Price Forecasting" }), to: "/features/price-prediction" },
        { label: t("exploreFeatures.f4Title", { defaultValue: "Smart Irrigation Advisor" }), to: "/features/irrigation" },
        { label: t("exploreFeatures.f3Title", { defaultValue: "Fertilizer & NPK Guidance" }), to: "/fertilizer-prediction" },
      ],
    },
    {
      title: t("footer.company", { defaultValue: "Platform & Access" }),
      links: [
        { label: t("nav.dashboard", { defaultValue: "Public Advisory Dashboard" }), to: "/dashboard" },
        { label: t("nav.my_dashboard", { defaultValue: "Farmer Profile Console" }), to: "/user-dashboard" },
        { label: t("footer.about", { defaultValue: "About KrishiAI" }), to: "/about" },
        { label: t("footer.contact", { defaultValue: "NGO & Cooperative Outreach" }), to: "/contact" },
      ],
    },
    {
      title: t("footer.sustainability", { defaultValue: "Agronomic Sustainability" }),
      links: [
        { label: t("footer.carbonReports", { defaultValue: "Soil Carbon & Health Reports" }), to: "/carbon-reports" },
        { label: t("footer.climateAction", { defaultValue: "Water Conservation Metrics" }), to: "/climate-action" },
        { label: t("footer.partnerFarms", { defaultValue: "KVK & FPO Partner Farms" }), to: "/partner-farms" },
      ],
    },
  ];

  return (
    <footer className="bg-white/80 dark:bg-stone-900/80 border-t border-stone-200/80 dark:border-stone-800 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">

        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/15">
              <Sprout size={22} className="text-emerald-300" />
            </div>
            <span className="font-black text-2xl tracking-tight text-stone-900 dark:text-white">
              Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
            </span>
          </Link>

          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-sm">
            Empowering Indian farmers with intelligent agricultural decisions across crop selection, nutrient balancing, irrigation, and mandi pricing.
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl w-fit">
            <ShieldCheck size={16} />
            <span>Built for NGOs, FPOs & Smallholder Farmers</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                {section.title}
              </h4>

              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors font-medium block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 dark:text-stone-500">
        <p>
          {t("footer.copyright", { defaultValue: "© 2026 KrishiAI • Empowering Indian Agriculture" })}
        </p>

        <p className="flex items-center gap-1 font-medium text-stone-500 dark:text-stone-400">
          Crafted with care for a greener, self-reliant farming future 🌿
        </p>
      </div>
    </footer>
  );
}