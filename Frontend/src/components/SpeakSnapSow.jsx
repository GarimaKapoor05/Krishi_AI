import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mic, Radio, Sparkles, Volume2, Globe } from "lucide-react";

export default function SpeakSnapSow() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-[#0b1b14] via-[#10241b] to-[#08130e] rounded-3xl p-6 sm:p-10 md:p-12 text-white shadow-2xl border border-emerald-900/40 relative overflow-hidden"
      >
        {/* Subtle ambient light circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Radio size={14} className="animate-pulse" />
              <span>{t("speakSnapSow.badge", { defaultValue: "Interaction Engine" })}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t("speakSnapSow.title", { defaultValue: "Multilingual AI-Powered Guidance" })}
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {t("speakSnapSow.desc", {
                defaultValue:
                  "Designed for Indian farmers of all literacy levels. Speak in your regional dialect to receive immediate, practical agronomic advice.",
              })}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs text-emerald-200">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                <Globe size={13} /> हिन्दी / Hindi
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                <Globe size={13} /> தமிழ் / Tamil
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                <Globe size={13} /> اردو / Urdu
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                <Globe size={13} /> English
              </span>
            </div>
          </div>

          {/* Interactive Simulated Voice & NLP Console */}
          <div className="w-full lg:w-80 bg-stone-900/80 border border-emerald-800/40 rounded-2xl p-5 font-mono text-xs text-emerald-300 shadow-xl backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-stone-400">
              <span className="flex items-center gap-1.5">
                <Mic size={14} className="text-emerald-400" />
                Speech Synthesis
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-stone-300">
              {t("speakSnapSow.term1", { defaultValue: "✓ initializing_voice_engine..." })}
            </p>
            <p className="text-stone-300">
              {t("speakSnapSow.term2", { defaultValue: "✓ connecting_to_llm_chain..." })}
            </p>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-stone-400">
                {t("speakSnapSow.term3", { defaultValue: "Engine Status:" })}
              </span>
              <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {t("speakSnapSow.term3Val", { defaultValue: "ONLINE" })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">
                {t("speakSnapSow.term4", { defaultValue: "Pipeline Latency:" })}
              </span>
              <span className="text-white font-bold">
                {t("speakSnapSow.term4Val", { defaultValue: "120ms" })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}