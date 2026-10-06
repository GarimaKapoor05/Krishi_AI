import { useTranslation } from "react-i18next";
import { Users, Target, Droplets, Sparkles } from "lucide-react";

export default function Stats() {
  const { t } = useTranslation();

  const stats = [
    {
      tag: t("stats.goal", { defaultValue: "Reach" }),
      value: "100K+",
      label: t("stats.goalLabel", { defaultValue: "Farmers Impacted" }),
      icon: Users,
    },
    {
      tag: t("stats.vision", { defaultValue: "Target" }),
      value: "95%",
      label: t("stats.visionLabel", { defaultValue: "Advisory Precision" }),
      icon: Target,
    },
    {
      tag: t("stats.target", { defaultValue: "Savings" }),
      value: "30%",
      label: t("stats.targetLabel", { defaultValue: "Water Savings" }),
      icon: Droplets,
    },
    {
      tag: t("stats.mission", { defaultValue: "Continuous" }),
      value: "100%",
      label: t("stats.missionLabel", { defaultValue: "Open & Free for Kisans" }),
      icon: Sparkles,
    },
  ];

  return (
    <section className="bg-gradient-to-br from-[#123628] via-[#1b4332] to-[#0f2d21] text-white py-14 sm:py-16 border-y border-emerald-800/40 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col items-center justify-between"
              >
                {/* Top Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold tracking-wider uppercase">
                  <Icon size={12} />
                  <span>{stat.tag}</span>
                </div>

                {/* Big Number */}
                <div className="my-2">
                  <span className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white">
                    {stat.value}
                  </span>
                </div>

                {/* Description Label */}
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium tracking-wide">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] sm:text-xs text-emerald-200/60 max-w-2xl mx-auto leading-relaxed">
          {t("stats.footer", {
            defaultValue: "Visionary targets for KrishiAI's grassroots deployment across Indian agro-climatic zones.",
          })}
        </p>
      </div>
    </section>
  );
}