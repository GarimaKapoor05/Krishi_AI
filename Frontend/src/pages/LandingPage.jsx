import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, CalendarDays, CloudSun, Landmark, LineChart, MapPin, ShieldCheck, Sprout, Store } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const services = [
  { key: "calendar", icon: CalendarDays, to: "/onboarding", tone: "bg-emerald-50 text-emerald-800" },
  { key: "weather", icon: CloudSun, to: "/dashboard", tone: "bg-sky-50 text-sky-800" },
  { key: "market", icon: LineChart, to: "/features/market-intelligence", tone: "bg-amber-50 text-amber-800" },
  { key: "schemes", icon: Landmark, to: "/features/schemes", tone: "bg-violet-50 text-violet-800" },
  { key: "marketplace", icon: Store, to: "/marketplace", tone: "bg-rose-50 text-rose-800" },
];

function FieldIllustration({ t }) {
  return (
    <div className="relative mx-auto w-full max-w-[34rem]" aria-label={t("landing.illustrationAlt")} role="img">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-emerald-100/55 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#edf5e9] p-4 shadow-[0_28px_80px_-38px_rgba(26,74,50,0.5)] sm:p-6">
        <div className="relative min-h-[19rem] overflow-hidden rounded-[1.5rem] bg-[#cfe6cd] sm:min-h-[23rem]">
          <div className="absolute -right-4 -top-8 h-36 w-36 rounded-full bg-[#f5d995] sm:h-44 sm:w-44" />
          <div className="absolute inset-x-0 top-[37%] h-28 bg-[#a9d09e] [clip-path:polygon(0_58%,18%_13%,36%_52%,55%_0,76%_55%,100%_18%,100%_100%,0_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[#4b8a59] [clip-path:polygon(0_8%,100%_0,100%_100%,0_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[43%] bg-[#34764d] [clip-path:polygon(0_25%,100%_0,100%_100%,0_100%)]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 370" fill="none" aria-hidden="true">
            <path d="M-20 354C112 292 190 291 293 346C382 393 463 378 570 315" stroke="#d5c28f" strokeWidth="3" opacity=".8" />
            <path d="M-20 321C103 269 183 264 282 316C377 366 462 351 570 287" stroke="#d5c28f" strokeWidth="3" opacity=".72" />
            <path d="M-20 290C103 240 180 235 275 286C370 337 463 321 570 257" stroke="#d5c28f" strokeWidth="3" opacity=".62" />
            <path d="M-20 260C99 212 178 207 268 257C365 309 466 290 570 227" stroke="#d5c28f" strokeWidth="3" opacity=".52" />
            <path d="M-20 230C99 184 174 177 260 228C361 281 463 260 570 198" stroke="#d5c28f" strokeWidth="3" opacity=".42" />
          </svg>
          <div className="absolute left-5 top-5 rounded-2xl border border-white/80 bg-white/90 px-3.5 py-3 shadow-lg backdrop-blur sm:left-7 sm:top-7 sm:px-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500"><MapPin size={14} className="text-emerald-700" />{t("landing.farmCardLabel")}</div>
            <div className="mt-1.5 text-sm font-bold text-stone-900">{t("landing.farmCardTitle")}</div>
          </div>
          <div className="absolute bottom-4 right-4 flex max-w-[14rem] items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-3 shadow-xl sm:bottom-6 sm:right-6 sm:max-w-[16rem] sm:px-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Sprout size={21} /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{t("landing.planCardLabel")}</p><p className="mt-0.5 text-xs font-semibold leading-snug text-stone-800">{t("landing.planCardTitle")}</p></div>
          </div>
          <div className="absolute bottom-9 left-7 text-white/85 sm:bottom-12 sm:left-10"><Sprout size={23} /><Sprout className="ml-12 mt-1" size={18} /></div>
        </div>
        <div className="flex items-center justify-between gap-4 px-1 pt-4 text-[11px] font-semibold text-emerald-950/70 sm:px-2 sm:pt-5 sm:text-xs">
          <span>{t("landing.illustrationCaption")}</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} />{t("landing.privacyNote")}</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const setupHref = isLoggedIn ? "/dashboard" : "/onboarding";
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden bg-[#faf9f5] text-stone-900 dark:bg-[#0b1410] dark:text-stone-100">
      <section className="relative px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:pb-24">
        <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-950/40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm dark:border-emerald-900 dark:bg-stone-900/80 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />{t("landing.eyebrow")}
            </div>
            <h1 className="max-w-2xl text-[2.65rem] font-extrabold leading-[1.06] tracking-[-0.045em] text-stone-950 dark:text-white sm:text-6xl lg:text-[4.2rem]">
              {t("landing.title")} <span className="text-emerald-800 dark:text-emerald-400">{t("landing.titleAccent")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 dark:text-stone-300 sm:text-lg sm:leading-8">{t("landing.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={setupHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                {isLoggedIn ? t("nav.dashboard", { defaultValue: t("landing.cta") }) : t("landing.cta")}<ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#farmer-tools" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
                {t("landing.explore")}<ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{t("landing.supportingNote")}</p>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.08 }}>
            <FieldIllustration t={t} />
          </motion.div>
        </div>
      </section>

      <section id="farmer-tools" className="scroll-mt-24 border-y border-stone-200/80 bg-white/75 px-4 py-14 dark:border-stone-800 dark:bg-stone-900/40 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">{t("landing.toolsEyebrow")}</p><h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-stone-950 dark:text-white sm:text-3xl">{t("landing.toolsTitle")}</h2></div>
            <p className="max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">{t("landing.toolsDescription")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {services.map(({ key, icon: Icon, to, tone }, index) => (
              <motion.div key={key} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: index * 0.04 }}>
                <Link to={to} className="group flex h-full min-h-44 flex-col rounded-2xl border border-stone-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-800 sm:p-5">
                  <span className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${tone} dark:bg-emerald-950/60 dark:text-emerald-300`}><Icon size={20} /></span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white">{t(`landing.tools.${key}.title`)}</span>
                  <span className="mt-1.5 flex-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{t(`landing.tools.${key}.description`)}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">{t("landing.learnMore")}<ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-9">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">{t("landing.nextStepEyebrow")}</p><h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{t("landing.nextStepTitle")}</h2><p className="mt-2 text-sm leading-6 text-emerald-100/80">{t("landing.nextStepDescription")}</p></div>
          <Link to={setupHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50">{isLoggedIn ? t("nav.dashboard", { defaultValue: t("landing.cta") }) : t("landing.cta")}<ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
