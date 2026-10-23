import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, CloudSun, Landmark, LineChart, MapPin, ShieldCheck, Sprout, Store, Leaf } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const services = [
  { key: "calendar", icon: CalendarDays, to: "/onboarding", tone: "bg-emerald-50 text-emerald-800" },
  { key: "weather", icon: CloudSun, to: "/dashboard", tone: "bg-sky-50 text-sky-800" },
  { key: "market", icon: LineChart, to: "/features/market-intelligence", tone: "bg-amber-50 text-amber-800" },
  { key: "schemes", icon: Landmark, to: "/features/schemes", tone: "bg-violet-50 text-violet-800" },
  { key: "marketplace", icon: Store, to: "/marketplace", tone: "bg-teal-50 text-teal-800" },
  { key: "disease", icon: Leaf, to: "/features/disease-detection", tone: "bg-lime-50 text-lime-800", title: "Crop health", description: "Get help checking a crop photo and possible next steps." },
];

function ProductPreview({ t }) {
  return (
    <div className="relative mx-auto w-full max-w-[38rem]">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-emerald-100/60 blur-2xl dark:bg-emerald-950/40" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_30px_90px_-45px_rgba(34,74,50,0.4)] dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-800 text-white"><Sprout size={19} /></span><div><p className="text-xs font-bold text-stone-900 dark:text-white">KrishiAI</p><p className="text-[10px] text-stone-500">{t("landing.previewLabel", { defaultValue: "A simple view of your farm" })}</p></div></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"><MapPin size={11} /> {t("landing.previewLocation", { defaultValue: "Your location" })}</span>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1.25fr_0.75fr] sm:p-5">
          <div className="rounded-2xl bg-[#f7f8f3] p-4 dark:bg-stone-800/70">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-800 dark:text-emerald-300">{t("landing.previewCropPlan", { defaultValue: "This week's farm plan" })}</p><p className="mt-1 text-sm font-bold text-stone-900 dark:text-white">{t("landing.previewCrop", { defaultValue: "Your crop, your next steps" })}</p></div><CalendarDays size={17} className="text-emerald-800 dark:text-emerald-300" /></div>
            <div className="mt-5 space-y-3">
              {[["Today", "Check the soil near the roots", "bg-emerald-600"], ["This week", "Review the local rain forecast", "bg-sky-600"], ["Coming up", "See your next crop task", "bg-amber-500"]].map(([when, task, tone]) => <div key={when} className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${tone}`} /><span className="w-[4.5rem] text-[10px] font-semibold text-stone-500 dark:text-stone-400">{when}</span><span className="text-[11px] font-medium text-stone-800 dark:text-stone-200">{task}</span></div>)}
            </div>
            <div className="mt-5 h-px bg-stone-200 dark:bg-stone-700" />
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400"><ShieldCheck size={12} className="text-emerald-700" />{t("landing.previewPrivacy", { defaultValue: "Your farm details stay with your account" })}</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 dark:border-sky-900/60 dark:bg-sky-950/30"><div className="flex items-center justify-between"><CloudSun size={18} className="text-sky-700 dark:text-sky-300" /><span className="text-[10px] font-semibold text-sky-800 dark:text-sky-200">7 days</span></div><p className="mt-4 text-xs font-bold text-stone-900 dark:text-white">Local weather</p><p className="mt-1 text-[10px] leading-relaxed text-stone-600 dark:text-stone-300">Forecast and rain outlook for your saved farm location.</p></div>
            <div className="flex-1 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30"><Sprout size={18} className="text-emerald-700 dark:text-emerald-300" /><p className="mt-3 text-xs font-bold text-stone-900 dark:text-white">{t("landing.previewBuiltAround", { defaultValue: "Built around your farm" })}</p><p className="mt-1 text-[10px] leading-relaxed text-stone-600 dark:text-stone-300">{t("landing.previewDescription", { defaultValue: "One farm profile helps the tools share what you have already told us." })}</p></div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 px-5 py-3 text-[10px] text-stone-500 dark:border-stone-800 dark:text-stone-400 sm:px-6"><span>{t("landing.previewFootnote", { defaultValue: "Illustrative product preview · information depends on your saved farm profile" })}</span><span className="font-semibold text-emerald-800 dark:text-emerald-300">{t("landing.previewTag", { defaultValue: "FARM TOOLS" })}</span></div>
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
      <section className="relative px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute right-[-10rem] top-12 h-[28rem] w-[28rem] rounded-full bg-[#e6efe1]/70 dark:bg-emerald-950/30" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-600" />{t("landing.eyebrow")}</p>
            <h1 className="max-w-xl text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.055em] text-stone-950 dark:text-white sm:text-6xl lg:text-[4.25rem]">{t("landing.title")} <span className="text-emerald-800 dark:text-emerald-400">{t("landing.titleAccent")}</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 dark:text-stone-300 sm:text-lg sm:leading-8">{t("landing.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={setupHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{isLoggedIn ? t("nav.dashboard", { defaultValue: t("landing.cta") }) : t("landing.cta")}<ArrowRight size={17} aria-hidden="true" /></Link>
              <Link to="/marketplace" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">{t("landing.marketplaceCta", { defaultValue: "Visit the marketplace" })}<Store size={16} aria-hidden="true" /></Link>
            </div>
            <p className="mt-5 max-w-md text-xs leading-relaxed text-stone-500 dark:text-stone-400">{t("landing.supportingNote")}</p>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}><ProductPreview t={t} /></motion.div>
        </div>
      </section>

      <section id="farmer-tools" className="scroll-mt-24 border-y border-stone-200/80 bg-white/75 px-4 py-14 dark:border-stone-800 dark:bg-stone-900/40 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">{t("landing.toolsEyebrow")}</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-stone-950 dark:text-white sm:text-3xl">{t("landing.toolsTitle")}</h2></div><p className="max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">{t("landing.toolsDescription")}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ key, icon: Icon, to, tone, title, description }, index) => <motion.div key={key} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.3, delay: index * 0.035 }}><Link to={to} className="group flex h-full min-h-40 flex-col rounded-2xl border border-stone-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-800"><span className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${tone} dark:bg-emerald-950/60 dark:text-emerald-300`}><Icon size={19} /></span><span className="text-sm font-bold text-stone-900 dark:text-white">{t(`landing.tools.${key}.title`, { defaultValue: title })}</span><span className="mt-1.5 flex-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{t(`landing.tools.${key}.description`, { defaultValue: description })}</span><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">{t("landing.learnMore")}<ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span></Link></motion.div>)}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16"><div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-9"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">{t("landing.nextStepEyebrow")}</p><h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{t("landing.nextStepTitle")}</h2><p className="mt-2 text-sm leading-6 text-emerald-100/80">{t("landing.nextStepDescription")}</p></div><Link to={setupHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50">{isLoggedIn ? t("nav.dashboard", { defaultValue: t("landing.cta") }) : t("landing.cta")}<ArrowRight size={16} /></Link></div></section>
    </div>
  );
}
