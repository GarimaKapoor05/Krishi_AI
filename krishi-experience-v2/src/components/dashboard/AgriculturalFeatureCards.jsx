import React from "react";
import {
  TrendingUp,
  ShieldAlert,
  Droplets,
  Store,
  ArrowRight,
  Sparkles,
  ExternalLink
} from "lucide-react";

export function AgriculturalFeatureCards({ onNavigate }) {
  const features = [
    {
      id: "market",
      title: "Market Intelligence & Mandis",
      badge: "Core Feature Active",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description: "Live APMC spot auction prices, 7-day rate curves, and AI price forecast for optimal crop selling windows.",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-brand-green",
      actionText: "Open Market Analytics"
    },
    {
      id: "disease",
      title: "Crop Disease Detection",
      badge: "Smart Diagnosis",
      badgeColor: "bg-amber-100 text-amber-800",
      description: "Take or upload a leaf photo to identify early fungal blights, rust, leaf miners, and receive organic control remedies.",
      icon: ShieldAlert,
      iconBg: "bg-amber-50 text-amber-700",
      actionText: "Check Leaf Health"
    },
    {
      id: "irrigation",
      title: "Smart Irrigation Advisor",
      badge: "Water Conservation",
      badgeColor: "bg-blue-100 text-blue-800",
      description: "Soil moisture calculation, evapotranspiration rates, and drip running minutes tailored to your farm soil.",
      icon: Droplets,
      iconBg: "bg-blue-50 text-blue-600",
      actionText: "View Water Plan"
    },
    {
      id: "marketplace",
      title: "Agricultural Marketplace",
      badge: "Kisan Bazar",
      badgeColor: "bg-purple-100 text-purple-800",
      description: "Source certified seeds, organic bio-fertilizers, rental farm machinery, and connect directly with verified buyers.",
      icon: Store,
      iconBg: "bg-purple-50 text-purple-700",
      actionText: "Browse Marketplace"
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border">
        <div>
          <h2 className="text-lg font-bold text-stone-900 font-sans">
            Agricultural Feature Hub
          </h2>
          <p className="text-xs text-stone-500">
            Dedicated tools built for precision farming and farm business profitability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.id}
              onClick={() => onNavigate && onNavigate(feat.id)}
              className="p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-card hover:shadow-elevated hover:border-brand-leaf/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${feat.iconBg} shadow-xs`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 mb-1.5 group-hover:text-brand-green transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-green group-hover:text-brand-emerald">
                <span>{feat.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
