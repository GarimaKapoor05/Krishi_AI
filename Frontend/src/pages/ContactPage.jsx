import { useState } from "react";
import { ArrowUpRight, AlertCircle, CheckCircle2, Handshake, Loader2, Mail, MapPin, Phone, Send, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

const EMAIL = "amitmehta0716@gmail.com";
const PHONE_DISPLAY = "+91 95723 71718";
const PHONE_LINK = "+919572371718";

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const submitContact = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const response = await api.post("/contact", form);
      setSuccess(response.data.message || "Your message has been recorded.");
      setEmailSent(Boolean(response.data.email_sent));
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (submitError) {
      setError(submitError.response?.data?.error || "We could not send your message. Please email or call us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] px-4 pb-16 pt-24 text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-100 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"><Handshake size={15} aria-hidden="true" />{t("contact.eyebrow", { defaultValue: "Partnerships and support" })}</div>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t("contact.title", { defaultValue: "Let’s make farm support more useful." })}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 dark:text-stone-300 sm:text-lg">{t("contact.intro", { defaultValue: "We welcome conversations with NGOs, farmer groups, FPOs, researchers and public-service teams working with farming communities." })}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${EMAIL}?subject=KrishiAI%20partnership%20enquiry`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{t("contact.emailCta", { defaultValue: "Email our team" })}<ArrowUpRight size={16} aria-hidden="true" /></a>
              <a href={`tel:${PHONE_LINK}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-stone-700 dark:text-stone-100 dark:hover:text-emerald-300"><Phone size={16} aria-hidden="true" />{t("contact.callCta", { defaultValue: "Call us" })}</a>
            </div>
          </div>
          <aside className="flex flex-col justify-between gap-8 bg-[#eef4ec] p-7 dark:bg-emerald-950/30 sm:p-10 lg:p-12">
            <div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-emerald-100"><Sprout size={23} aria-hidden="true" /></div><h2 className="mt-6 text-xl font-extrabold">{t("contact.contactTitle", { defaultValue: "Contact KrishiAI" })}</h2><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{t("contact.contactNote", { defaultValue: "For partnership enquiries, field feedback, product questions or support." })}</p></div>
            <div className="space-y-3">
              <a href={`mailto:${EMAIL}`} className="flex min-h-16 items-center gap-3 rounded-xl border border-white/80 bg-white/80 p-4 text-sm font-semibold text-stone-800 transition hover:border-emerald-500 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><Mail size={17} aria-hidden="true" /></span><span className="min-w-0"><span className="block text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{t("contact.emailLabel", { defaultValue: "Email" })}</span><span className="break-all">{EMAIL}</span></span></a>
              <a href={`tel:${PHONE_LINK}`} className="flex min-h-16 items-center gap-3 rounded-xl border border-white/80 bg-white/80 p-4 text-sm font-semibold text-stone-800 transition hover:border-emerald-500 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"><Phone size={17} aria-hidden="true" /></span><span><span className="block text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{t("contact.phoneLabel", { defaultValue: "Phone" })}</span>{PHONE_DISPLAY}</span></a>
            </div>
            <p className="flex items-start gap-2 text-xs leading-5 text-stone-600 dark:text-stone-400"><MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{t("contact.coverage", { defaultValue: "KrishiAI is designed for Indian farming communities. Weather uses the farm location saved in the farmer’s profile." })}</p>
          </aside>
        </section>
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-9">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold">Send us a message</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">Use this form for NGO partnerships, field feedback, product questions, or support. For urgent help, email or call directly.</p>
          </div>
          {(error || success) && <div role={error ? "alert" : "status"} className={`mt-5 flex items-start gap-2 rounded-xl border p-3 text-sm ${error ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : emailSent ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}>{error ? <AlertCircle size={17} className="mt-0.5 shrink-0" /> : emailSent ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}{error || success}</div>}
          <form onSubmit={submitContact} className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Your name *", "text", "Your full name"],
              ["email", "Email address *", "email", "name@example.com"],
              ["phone", "Phone number (optional)", "tel", "+91"],
            ].map(([name, label, type, placeholder]) => (
              <label key={name} className="space-y-1.5 text-sm font-semibold">
                <span>{label}</span>
                <input required={name !== "phone"} type={type} maxLength={name === "name" ? 100 : 120} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-emerald-950" />
              </label>
            ))}
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Subject *</span>
              <select required value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm dark:border-stone-700 dark:bg-stone-950">
                <option value="" disabled>Choose a subject</option>
                <option>NGO / FPO partnership</option>
                <option>Farmer support</option>
                <option>Product feedback</option>
                <option>Technical issue</option>
                <option>Other</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold sm:col-span-2">
              <span>Your message *</span>
              <textarea required minLength={10} maxLength={3000} rows={5} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Tell us how we can help…" className="w-full resize-y rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-emerald-950" />
              <span className="block text-right text-xs font-normal text-stone-500">{form.message.length}/3000</span>
            </label>
            <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60 sm:w-fit">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </section>
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["contact.partnershipTitle", "NGO and FPO partnerships", "contact.partnershipText", "Discuss field pilots, farmer onboarding and practical feedback from your communities."],
            ["contact.dataTitle", "Responsible information", "contact.dataText", "Help us make data sources, service limits and farmer-facing guidance clear."],
            ["contact.accessTitle", "Inclusive access", "contact.accessText", "Share what farmers need for language, accessibility, connectivity and local support."],
          ].map(([titleKey, titleDefault, bodyKey, bodyDefault]) => <article key={titleKey} className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6"><h2 className="font-bold">{t(titleKey, { defaultValue: titleDefault })}</h2><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{t(bodyKey, { defaultValue: bodyDefault })}</p></article>)}
        </section>
      </div>
    </div>
  );
}
