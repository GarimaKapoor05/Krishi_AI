import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import {
  Landmark,
  ChevronDown,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Info,
  FileText,
  IndianRupee,
  Sprout,
  AlertCircle,
} from "lucide-react";

// ── Real Government Schemes Database ─────────────────────────────────────────
const SCHEMES = [
  {
    id: "pm_kisan",
    name: "PM-KISAN",
    fullName: "Pradhan Mantri Kisan Samman Nidhi",
    benefit: "₹6,000/year (3 instalments of ₹2,000)",
    category: "Income Support",
    color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
    icon: IndianRupee,
    applyLink: "https://pmkisan.gov.in",
    documents: ["Aadhaar Card", "Bank Account (linked to Aadhaar)", "Land Records"],
    eligibility: (f) =>
      f.landType !== "Leased" &&
      parseFloat(f.landSize) <= 5 &&
      parseInt(f.annualIncome) <= 200000,
    reason: (f) =>
      `You own ${f.landSize} acres of land and your annual income qualifies you for direct income support of ₹6,000/year.`,
  },
  {
    id: "pmfby",
    name: "PMFBY",
    fullName: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Crop loss compensation up to full sum insured",
    category: "Crop Insurance",
    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
    icon: Sprout,
    applyLink: "https://pmfby.gov.in",
    documents: ["Aadhaar", "Bank Passbook", "Land Records", "Sowing Certificate"],
    eligibility: (f) => f.needsHelp.includes("Crop Insurance") && f.currentCrops !== "",
    reason: (f) =>
      `You're growing ${f.currentCrops} and need crop insurance support. PMFBY covers losses due to natural calamities at very low premium rates.`,
  },
  {
    id: "kcc",
    name: "KCC",
    fullName: "Kisan Credit Card",
    benefit: "Credit up to ₹3 lakh at 4% interest rate",
    category: "Credit / Loan",
    color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
    icon: IndianRupee,
    applyLink: "https://www.nabard.org/content1.aspx?id=572",
    documents: ["Aadhaar", "PAN Card", "Land Records", "Passport Photo"],
    eligibility: (f) =>
      f.hasKCC === "No" &&
      (f.needsHelp.includes("Loan") || f.needsHelp.includes("Seeds") || f.needsHelp.includes("Machinery")),
    reason: (f) =>
      `You don't have a Kisan Credit Card yet and need ${f.needsHelp.join(", ")} support. KCC gives you instant credit at just 4% interest.`,
  },
  {
    id: "pmksy",
    name: "PMKSY",
    fullName: "Pradhan Mantri Krishi Sinchai Yojana",
    benefit: "Subsidy on micro-irrigation (drip/sprinkler) — up to 55%",
    category: "Irrigation",
    color: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300",
    icon: Sprout,
    applyLink: "https://pmksy.gov.in",
    documents: ["Aadhaar", "Land Records", "Bank Account", "Irrigation Source Proof"],
    eligibility: (f) =>
      f.hasIrrigation === "Yes" &&
      f.needsHelp.includes("Irrigation"),
    reason: (f) =>
      `You have irrigation and need irrigation support. PMKSY provides up to 55% subsidy on drip and sprinkler systems to improve water efficiency.`,
  },
  {
    id: "smam",
    name: "SMAM",
    fullName: "Sub-Mission on Agricultural Mechanisation",
    benefit: "40–50% subsidy on farm machinery and equipment",
    category: "Machinery",
    color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
    icon: Sprout,
    applyLink: "https://agrimachinery.nic.in",
    documents: ["Aadhaar", "Land Records", "Bank Account", "Caste Certificate (if SC/ST)"],
    eligibility: (f) => f.needsHelp.includes("Machinery"),
    reason: (f) =>
      `You need machinery support. SMAM offers 40-50% subsidy on tractors, tillers, and other equipment — higher for SC/ST farmers.`,
  },
  {
    id: "nfsm",
    name: "NFSM",
    fullName: "National Food Security Mission",
    benefit: "Free/subsidised seeds, fertilizers, and training",
    category: "Seeds & Input",
    color: "bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800",
    badge: "bg-lime-100 dark:bg-lime-900/40 text-lime-800 dark:text-lime-300",
    icon: Sprout,
    applyLink: "https://nfsm.gov.in",
    documents: ["Aadhaar", "Land Records", "Bank Account"],
    eligibility: (f) =>
      f.needsHelp.includes("Seeds") &&
      ["Rice", "Wheat", "Pulses", "Maize"].some((c) =>
        f.currentCrops.toLowerCase().includes(c.toLowerCase())
      ),
    reason: (f) =>
      `You're growing ${f.currentCrops} and need seed support. NFSM provides subsidised high-yield seeds and fertilizers for food security crops.`,
  },
  {
    id: "pkvy",
    name: "PKVY",
    fullName: "Paramparagat Krishi Vikas Yojana",
    benefit: "₹50,000/hectare over 3 years for organic farming",
    category: "Organic Farming",
    color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
    icon: Sprout,
    applyLink: "https://pgsindia-ncof.gov.in",
    documents: ["Aadhaar", "Land Records", "Group Formation Certificate"],
    eligibility: (f) =>
      f.needsHelp.includes("Subsidy") &&
      parseFloat(f.landSize) >= 1,
    reason: (f) =>
      `You have ${f.landSize} acres and need subsidy support. PKVY supports cluster-based organic farming with ₹50,000/hectare over 3 years.`,
  },
  {
    id: "livestock",
    name: "AHIDF",
    fullName: "Animal Husbandry Infrastructure Development Fund",
    benefit: "3% interest subvention on loans up to ₹2 crore",
    category: "Livestock",
    color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
    icon: IndianRupee,
    applyLink: "https://dahd.gov.in",
    documents: ["Aadhaar", "Business Plan", "Bank Account", "Land/Shed Documents"],
    eligibility: (f) => f.hasLivestock === "Yes",
    reason: (f) =>
      `You have livestock. AHIDF provides subsidised loans at 3% interest for dairy, poultry, and meat processing infrastructure.`,
  },
];

const HELP_OPTIONS = [
  "Loan", "Subsidy", "Irrigation", "Machinery",
  "Crop Insurance", "Seeds", "Organic Farming", "Livestock Support", "Other"
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

// ── Match schemes against form data ──────────────────────────────────────────
function matchSchemes(formData) {
  return SCHEMES.filter((s) => {
    try { return s.eligibility(formData); }
    catch { return false; }
  });
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

// ── Input style ───────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green placeholder-gray-400 transition";

const selectCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition";

// ── Main Component ────────────────────────────────────────────────────────────
export default function GovSchemeAdvisor() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.username || "",
    age: "",
    gender: "",
    state: user?.location?.split(",")[0]?.trim() || "",
    district: "",
    landSize: "",
    landType: "",
    currentCrops: "",
    hasIrrigation: "",
    waterSource: "",
    annualIncome: "",
    farmerCategory: "",
    hasKCC: "",
    hasLivestock: "",
    needsHelp: [],
    hasExistingScheme: "",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleHelp = (opt) => {
    setForm((f) => ({
      ...f,
      needsHelp: f.needsHelp.includes(opt)
        ? f.needsHelp.filter((x) => x !== opt)
        : [...f.needsHelp, opt],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setAiExplanation("");
    setLoading(true);

    // Rule-based matching (instant, no API)
    const matched = matchSchemes(form);
    setResults(matched);
    setLoading(false);

    // AI explanation layer
    if (matched.length > 0) {
      setAiLoading(true);
      try {
        const prompt = `You are a government scheme advisor for Indian farmers. 
A farmer named ${form.name} from ${form.state} with ${form.landSize} acres of ${form.landType} land 
growing ${form.currentCrops} has been matched with these schemes: ${matched.map(s => s.name).join(", ")}.
Their annual income is ₹${form.annualIncome}, category: ${form.farmerCategory}, needs: ${form.needsHelp.join(", ")}.
In 3-4 sentences, give them a warm, simple, actionable summary in plain English of what they should do first 
and which scheme is most urgent for their situation. Be specific, not generic.`;

        const res = await fetch(`${API_URL}/api/ai/scheme-advice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, farmer: form, schemes: matched.map(s => s.name) }),
        });

        if (res.ok) {
          const data = await res.json();
          setAiExplanation(data.advice || "");
        }
      } catch {
        // AI layer is optional — fail silently, rule-based results still show
      }
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] dark:bg-gray-950 pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-brand-green px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Landmark size={16} />
            Government Scheme Advisor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Find Schemes You Qualify For
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            Fill in your farm details and we'll match you with real central and state government schemes — instantly.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-6"
        >

          {/* Section: Basic Info */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              👤 Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input className={inputCls} placeholder="Ramesh Patel" value={form.name}
                  onChange={e => set("name", e.target.value)} required />
              </Field>
              <Field label="Age" required>
                <input className={inputCls} type="number" placeholder="35" value={form.age}
                  onChange={e => set("age", e.target.value)} required min="18" max="99" />
              </Field>
              <Field label="Gender" required>
                <select className={selectCls} value={form.gender}
                  onChange={e => set("gender", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Farmer Category" required>
                <select className={selectCls} value={form.farmerCategory}
                  onChange={e => set("farmerCategory", e.target.value)} required>
                  <option value="">Select</option>
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Section: Location */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              📍 Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="State" required>
                <select className={selectCls} value={form.state}
                  onChange={e => set("state", e.target.value)} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="District" required>
                <input className={inputCls} placeholder="e.g. Sehore" value={form.district}
                  onChange={e => set("district", e.target.value)} required />
              </Field>
            </div>
          </div>

          {/* Section: Land */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              🌾 Land & Crops
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Total Land Size (acres)" required hint="1 acre = 0.4 hectares">
                <input className={inputCls} type="number" step="0.1" placeholder="2.5"
                  value={form.landSize} onChange={e => set("landSize", e.target.value)} required min="0.1" />
              </Field>
              <Field label="Land Type" required>
                <select className={selectCls} value={form.landType}
                  onChange={e => set("landType", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Own</option>
                  <option>Leased</option>
                  <option>Sharecropper</option>
                </select>
              </Field>
              <Field label="Current Crop(s)" required hint="e.g. Wheat, Rice, Soybean" className="sm:col-span-2">
                <input className={inputCls} placeholder="Wheat, Soybean"
                  value={form.currentCrops} onChange={e => set("currentCrops", e.target.value)} required />
              </Field>
            </div>
          </div>

          {/* Section: Irrigation */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              💧 Irrigation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Do you have irrigation?" required>
                <select className={selectCls} value={form.hasIrrigation}
                  onChange={e => set("hasIrrigation", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              {form.hasIrrigation === "Yes" && (
                <Field label="Water Source">
                  <input className={inputCls} placeholder="e.g. Borewell, Canal, River"
                    value={form.waterSource} onChange={e => set("waterSource", e.target.value)} />
                </Field>
              )}
            </div>
          </div>

          {/* Section: Financial */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              💰 Financial Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Annual Farming Income (₹)" required hint="Approximate is fine">
                <input className={inputCls} type="number" placeholder="150000" min="0"
                  value={form.annualIncome} onChange={e => set("annualIncome", e.target.value)} required />
              </Field>
              <Field label="Have Kisan Credit Card?" required>
                <select className={selectCls} value={form.hasKCC}
                  onChange={e => set("hasKCC", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field label="Have Livestock?" required>
                <select className={selectCls} value={form.hasLivestock}
                  onChange={e => set("hasLivestock", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field label="Any existing scheme/benefit?" required>
                <select className={selectCls} value={form.hasExistingScheme}
                  onChange={e => set("hasExistingScheme", e.target.value)} required>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Section: Help Needed */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              🆘 What help do you need?
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {HELP_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleHelp(opt)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
                    form.needsHelp.includes(opt)
                      ? "bg-brand-green text-white border-brand-green"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-green"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || form.needsHelp.length === 0}
            className="w-full bg-brand-green hover:bg-green-700 text-white py-4 rounded-2xl font-semibold text-base transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Finding Schemes...</>
            ) : (
              <><Landmark size={20} /> Find My Schemes</>
            )}
          </button>

          {form.needsHelp.length === 0 && (
            <p className="text-xs text-center text-amber-500">
              Please select at least one type of help you need.
            </p>
          )}

        </motion.form>

        {/* Results */}
        <AnimatePresence>
          {results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-6"
            >

              {/* AI Summary */}
              {(aiLoading || aiExplanation) && (
                <div className="bg-brand-green/5 dark:bg-green-900/20 border border-brand-green/20 dark:border-green-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-brand-green" />
                    <span className="text-sm font-bold text-brand-green">AI Advisor Summary</span>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      Generating personalised advice...
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Result count */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {results.length > 0
                    ? `${results.length} scheme${results.length > 1 ? "s" : ""} matched`
                    : "No schemes matched"}
                </h2>
                {results.length > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Based on your profile
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
                  <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
                  <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    No direct matches found
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Try selecting more help categories or contact your local Krishi Vigyan Kendra for personalised guidance.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((scheme, i) => {
                    const Icon = scheme.icon;
                    return (
                      <motion.div
                        key={scheme.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`border rounded-2xl p-5 sm:p-6 ${scheme.color}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                              <Icon size={18} className="text-brand-green" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                  {scheme.name}
                                </h3>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scheme.badge}`}>
                                  {scheme.category}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {scheme.fullName}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 size={20} className="text-brand-green shrink-0 mt-1" />
                        </div>

                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl px-4 py-3 mb-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Benefit</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{scheme.benefit}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Why you qualify
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {scheme.reason(form)}
                          </p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <FileText size={12} /> Documents needed
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {scheme.documents.map((doc) => (
                              <span key={doc}
                                className="text-xs bg-white/80 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>

                        <a
                          href={scheme.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                        >
                          Apply Now
                          <ExternalLink size={14} />
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-2">
                Scheme eligibility is indicative. Visit the official portal or your nearest Krishi Vigyan Kendra to confirm and apply.
              </p>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
