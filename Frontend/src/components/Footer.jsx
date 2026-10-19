import { Sprout, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const sections = [
    {
      title: "Farmer Services",
      links: [
        { label: "Farm Dashboard", to: "/dashboard" },
        { label: "Mandi Prices & Trends", to: "/features/market-intelligence" },
        { label: "Government Schemes", to: "/features/schemes" },
        { label: "Irrigation Advisor", to: "/features/irrigation" },
        { label: "Farmer Marketplace", to: "/marketplace" },
      ],
    },
    {
      title: "Account & Setup",
      links: [
        { label: "Start Onboarding", to: "/onboarding" },
        { label: "Farmer Login", to: "/login" },
        { label: "Create Account", to: "/register" },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Brand Column */}
        <div className="md:col-span-6 space-y-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
              <Sprout size={20} className="text-emerald-200" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white">
              Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
            </span>
          </Link>

          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-sm">
            Empowering Indian smallholder farmers with simple, data-driven crop planning, verified mandi prices, and government scheme guidance.
          </p>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
            <ShieldCheck size={14} />
            <span>Built for Indian Agriculture</span>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="md:col-span-6 grid grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
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

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <p>© 2026 Krishi AI. Designed for smallholder farmers across India.</p>
        <p>Simple, honest agricultural support 🌿</p>
      </div>
    </footer>
  );
}
