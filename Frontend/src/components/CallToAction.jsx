import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, MessageCircle, Phone, Sprout, ShieldCheck, ArrowRight } from "lucide-react";
import { API_URL } from "../config";
import { useTranslation } from "react-i18next";

export default function CallToAction() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!formData.phone) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Website Visitor",
          phone: formData.phone,
          email: formData.email,
          message: "Call back request from homepage",
        }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        setSubmitted(true);
        setMessage("cta.success");
        setFormData({ name: "", phone: "", email: "" });
      } else {
        setMessage("cta.errWrong");
      }
    } catch (err) {
      setMessage("cta.errServer");
    }
    setLoading(false);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-bg-light dark:bg-bg-dark transition-colors">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 p-8 sm:p-16 rounded-3xl sm:rounded-[3rem] text-white shadow-card relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-xs sm:text-sm font-bold shadow-xs">
            <Sprout size={16} />
            <span>Transforming Agronomic Decision Making</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t("cta.title", { defaultValue: "Your farm. Smarter. Starting today." })}
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed">
            {t("cta.desc", {
              defaultValue:
                "Built for Indian farmers — AI-powered crop advice, fertilizer recommendations, and irrigation scheduling, all in one platform.",
            })}
          </p>

          {/* Primary CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-base shadow-xl transition-all"
            >
              <span>{t("cta.btnStart", { defaultValue: "Start Your Smart Farm →" })}</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/20 hover:border-white/50 text-white font-bold text-base transition-all"
            >
              <span>Explore Public Dashboard</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-emerald-200/60 font-bold">
              {t("cta.divider", { defaultValue: "or partner with us" })}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl mx-auto">
            {t("cta.note", {
              defaultValue:
                "Deploying KrishiAI for your Farmer Producer Organization (FPO), cooperative, or NGO? Leave your number — our agricultural team will call you.",
            })}
          </p>

          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-400 text-emerald-200 px-6 py-4 rounded-2xl text-sm font-semibold max-w-md mx-auto">
              {t(message, { defaultValue: "✅ Thank you! Our team will connect with you within 24 hours." })}
            </div>
          ) : (
            <form onSubmit={handleContact} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("cta.placeholderName", { defaultValue: "Your name or organization" })}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <div className="flex-1 flex items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-emerald-400">
                <Phone size={16} className="text-stone-300 mr-2.5 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("cta.placeholderPhone", { defaultValue: "+91 Mobile number" })}
                  required
                  className="w-full bg-transparent text-white placeholder:text-stone-300 text-sm outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-6 py-3.5 rounded-2xl text-sm transition flex items-center gap-2 justify-center disabled:opacity-70 whitespace-nowrap shadow-md"
              >
                <Send size={15} />
                <span>{t("cta.btnCallback", { defaultValue: "Call me back" })}</span>
              </button>
            </form>
          )}

          {/* WhatsApp */}
          <div className="pt-2">
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I'm%20interested%20in%20Krishi%20AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/80 hover:text-white transition"
            >
              <MessageCircle size={16} />
              <span>{t("cta.whatsapp", { defaultValue: "Or message our field team on WhatsApp" })}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}