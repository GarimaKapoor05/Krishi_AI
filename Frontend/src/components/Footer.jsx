import { ArrowUpRight, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const sections = [
    {
      title: t("footer.servicesTitle"),
      links: [
        { label: t("footer.dashboard"), to: "/dashboard" },
        { label: t("footer.mandi"), to: "/features/market-intelligence" },
        { label: t("footer.schemes"), to: "/features/schemes" },
        { label: t("footer.irrigation"), to: "/features/irrigation" },
        { label: t("footer.marketplace"), to: "/marketplace" },
      ],
    },
    {
      title: t("footer.accountTitle"),
      links: [
        { label: t("footer.setup"), to: "/onboarding" },
        { label: t("footer.login"), to: "/login" },
        { label: t("footer.createAccount"), to: "/register" },
      ],
    },
  ];

  return (
    <footer className="border-t border-stone-200 bg-[#f2f3ec] px-4 py-10 transition-colors dark:border-stone-800 dark:bg-[#0e1913] sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-9 md:grid-cols-12 md:gap-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-6">
          <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800 text-white">
              <Sprout size={20} className="text-emerald-200" aria-hidden="true" />
            </span>
            <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white">
              Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
            </span>
          </Link>

          <p className="max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">
            {t("footer.productDescription")}
          </p>

          <p className="max-w-md text-xs leading-5 text-stone-500 dark:text-stone-500">
            {t("footer.independentNote")}
          </p>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 gap-6 md:col-span-6 md:gap-10">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-stone-900 dark:text-white">
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-sm text-stone-600 transition-colors hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300"
                    >
                      {link.label}<ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-stone-200 pt-5 text-xs leading-5 text-stone-500 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        <p>{t("footer.serviceNote")}</p>
      </div>
    </footer>
  );
}
