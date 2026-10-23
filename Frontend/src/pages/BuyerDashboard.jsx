import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Search,
  Send,
  ShoppingBasket,
  SlidersHorizontal,
  Sprout,
  Star,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GradeBadge from "../components/GradeBadge";
import GradeReportCard from "../components/GradeReportCard";
import {
  apiError,
  browseListings,
  imageUrl,
  listingDetail,
  marketplaceStats,
  sentInquiries,
  sendInquiry,
} from "../services/marketplace";

const GRADE_OPTIONS = [
  { value: "", label: "All grades" },
  { value: "A", label: "Grade A only" },
  { value: "B", label: "Grade B only" },
  { value: "C", label: "Grade C only" },
  { value: "Needs review", label: "Needs review" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "grade", label: "Best grade first" },
  { value: "price_low", label: "Lowest price first" },
];

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white leading-none">
            {value}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mt-1">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  const [tab, setTab] = useState("browse");
  const [filters, setFilters] = useState({ q: "", location: "", grade: "", sort: "newest" });
  const [listings, setListings] = useState([]);
  const [listingPage, setListingPage] = useState(1);
  const [listingPages, setListingPages] = useState(1);
  const [listingTotal, setListingTotal] = useState(0);
  const [gradesAvailable, setGradesAvailable] = useState(null);
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: listingPage, per_page: 24 };
      if (filters.q) params.q = filters.q;
      if (filters.location) params.location = filters.location;
      if (filters.grade) params.grade = filters.grade;
      if (filters.sort) params.sort = filters.sort;
      const res = await browseListings(params);
      const liveListings = res.data.items || [];
      setListings(liveListings);
      setGradesAvailable(res.data.grades_available || null);
      setListingTotal(res.data.total || 0);
      setListingPages(res.data.pages || 1);
    } catch (err) {
      setError(apiError(err, "Could not load the marketplace feed."));
      setListings([]);
      setGradesAvailable(null);
      setListingTotal(0);
      setListingPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, listingPage]);

  const loadMeta = useCallback(async () => {
    try {
      const [statsRes, sentRes] = await Promise.all([
        marketplaceStats(),
        sentInquiries(),
      ]);
      setStats(statsRes.data);
      setInquiries(sentRes.data.items || []);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    loadListings();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadListings();
    }, 60_000);
    const refreshOnFocus = () => loadListings();
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadListings]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const openListing = (listing) => {
    setSelected(listing);
    setMessage("");
    setInquiryError("");
    setSent(false);
    setDetailLoading(true);
    listingDetail(listing.id)
      .then((res) => setSelected(res.data.listing))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

  const submitInquiry = async () => {
    if (!selected) return;
    if (!isLoggedIn) {
      setInquiryError("Sign in as a buyer before sending an inquiry.");
      return;
    }
    if (selected.seller_id === user?.id) {
      setInquiryError("You cannot send an inquiry on your own listing.");
      return;
    }
    if (message.trim().length < 5) {
      setInquiryError("Please write a short message (at least 5 characters).");
      return;
    }
    setSending(true);
    setInquiryError("");
    try {
      await sendInquiry(selected.id, message.trim());
      setSent(true);
      setMessage("");
      loadMeta();
    } catch (err) {
      setInquiryError(apiError(err, "Could not send your inquiry. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const market = stats?.marketplace || {};
  const buyer = stats?.buyer || {};
  const gradeCounts = market.grade_counts || {};
  const report = selected?.grade_report;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/50 px-3 py-1 rounded-full mb-3">
              <ShoppingBasket size={14} />
              Buyer Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Welcome, {user?.username || "Buyer"} 🧺
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
              Browse farmer lots with transparent AI-assisted grades, then connect directly.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60">
            <AlertCircle size={15} className="text-amber-600" />
            Grades are AI visual estimates, not lab certificates
          </div>
          <Link to="/seller-dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900">
            <Sprout size={15} /> Sell your harvest
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Package}
            label="Active listings"
            value={market.active_listings ?? "—"}
            tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          />
          <StatCard
            icon={Star}
            label="Grade A lots"
            value={gradeCounts.A ?? "—"}
            tone="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
          />
          <StatCard
            icon={Sprout}
            label="Crops available"
            value={market.crops_available ?? "—"}
            tone="bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
          />
          <StatCard
            icon={Send}
            label="My inquiries"
            value={buyer.my_sent_inquiries ?? inquiries.length}
            tone="bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 px-4 py-3 rounded-2xl text-sm font-medium">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button className="ml-auto" onClick={() => setError("")} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        )}


        {/* Tabs */}
        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800">
          {[
            { key: "browse", label: "Browse Marketplace" },
            { key: "my", label: `My Inquiries (${inquiries.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition ${
                tab === t.key
                  ? "text-sky-800 dark:text-sky-300 border-b-2 border-sky-700 bg-sky-50/60 dark:bg-sky-950/30"
                  : "text-stone-500 dark:text-stone-400 hover:text-sky-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Browse Tab ── */}
        {tab === "browse" && (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Browse active farmer listings across India. Search by crop and filter by city, district or state. New offers refresh automatically.</p>
              <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1 flex items-center gap-2 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 bg-stone-50/60 dark:bg-stone-800/40">
                <Search size={16} className="text-stone-400" />
                <input
                  value={filters.q}
                  onChange={(e) => { setListingPage(1); setFilters((f) => ({ ...f, q: e.target.value })); }}
                  onKeyDown={(e) => e.key === "Enter" && loadListings()}
                  placeholder="Search crop, variety or location…"
                  className="w-full bg-transparent outline-none text-sm font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-stone-400 hidden sm:block" />
                <select
                  value={filters.grade}
                  onChange={(e) => { setListingPage(1); setFilters((f) => ({ ...f, grade: e.target.value })); }}
                  className="border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-sm font-semibold bg-stone-50/60 dark:bg-stone-800/40"
                >
                  {GRADE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sort}
                  onChange={(e) => { setListingPage(1); setFilters((f) => ({ ...f, sort: e.target.value })); }}
                  className="border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-sm font-semibold bg-stone-50/60 dark:bg-stone-800/40"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadListings}
                  className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
                >
                  Search
                </button>
              </div>
              </div>
              <div className="flex items-center gap-2 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 bg-stone-50/60 dark:bg-stone-800/40 lg:w-64">
                <MapPin size={16} className="shrink-0 text-stone-400" />
                <input value={filters.location} onChange={(e) => { setListingPage(1); setFilters((f) => ({ ...f, location: e.target.value })); }} onKeyDown={(e) => e.key === "Enter" && loadListings()} placeholder="City, district or state" aria-label="Filter listings by city, district or state" className="w-full bg-transparent outline-none text-sm font-semibold" />
              </div>
            </div>

            {/* Grade chips */}
            {gradesAvailable && (
              <div className="flex flex-wrap gap-2">
                {["A", "B", "C", "Needs review"].map((g) => (
                  <button
                    key={g}
                    onClick={() => { setListingPage(1); setFilters((f) => ({ ...f, grade: f.grade === g ? "" : g })); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                      filters.grade === g
                        ? "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900"
                        : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-sky-500"
                    }`}
                  >
                    {g === "Needs review" ? "Needs review" : `Grade ${g}`} ·{" "}
                    {gradesAvailable[g] ?? 0}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="py-16 text-center text-stone-400">
                <Loader2 size={26} className="mx-auto animate-spin" />
                <p className="text-sm mt-2">Loading fresh produce…</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-12 text-center">
                <Store size={28} className="mx-auto text-stone-400 mb-3" />
                <h3 className="font-extrabold">No live listings found</h3>
                <p className="mx-auto mt-1 max-w-lg text-sm text-stone-500 dark:text-stone-400">
                  Try a broader search, or invite a farmer to publish a lot with a crop photo, description, available quantity and asking price.
                </p>
                <Link to="/seller-dashboard" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">
                  <Sprout size={15} /> Sell your harvest
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map((l) => (
                  <motion.button
                    key={l.id}
                    whileHover={{ y: -3 }}
                    onClick={() => openListing(l)}
                    className="text-left bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative h-40 bg-stone-100 dark:bg-stone-800">
                      {l.image_url ? (
                        <img
                          src={imageUrl(l.image_url)}
                          alt={l.crop_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Package size={24} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <GradeBadge grade={l.grade} confidence={l.confidence_score} size="sm" />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-1.5">
                      <h3 className="font-extrabold text-stone-900 dark:text-white">
                        {l.crop_name}
                        {l.variety ? (
                          <span className="font-medium text-stone-400"> · {l.variety}</span>
                        ) : null}
                      </h3>
                      {l.description && <p className="line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{l.description}</p>}
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Package size={12} /> {l.quantity} {l.quantity_unit}
                        </span>
                        {l.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {l.location}
                          </span>
                        )}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                          {l.price_per_unit != null
                            ? `₹${l.price_per_unit}/${l.quantity_unit.replace(/s$/, "")}`
                            : "Price on request"}
                        </span>
                        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
                          View details →
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            {!loading && listingPages > 1 && (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
                <p className="text-xs text-stone-500 dark:text-stone-400">{listingTotal.toLocaleString("en-IN")} live listings · page {listingPage} of {listingPages}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={listingPage <= 1} onClick={() => setListingPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold disabled:opacity-40 dark:border-stone-700">Previous</button>
                  <button type="button" disabled={listingPage >= listingPages} onClick={() => setListingPage((page) => Math.min(listingPages, page + 1))} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold disabled:opacity-40 dark:border-stone-700">Next</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── My Inquiries Tab ── */}
        {tab === "my" && (
          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-10 text-center">
                <Send size={26} className="mx-auto text-stone-400 mb-3" />
                <h3 className="font-extrabold">No inquiries sent yet</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Open any listing and send a message to the farmer.
                </p>
              </div>
            ) : (
              inquiries.map((i) => (
                <div
                  key={i.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                    <Send size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-white">
                      {i.crop_name}
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                      “{i.message}”
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {i.created_at ? new Date(i.created_at).toLocaleString("en-IN") : ""} ·
                      Status: {i.status}
                    </p>
                  </div>
                  {i.grade && <GradeBadge grade={i.grade} size="sm" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-4xl mx-auto bg-bg-light dark:bg-stone-950 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="font-extrabold text-lg">
                  {selected.crop_name}
                  {selected.variety ? (
                    <span className="font-medium text-stone-400"> · {selected.variety}</span>
                  ) : null}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3 flex-wrap mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Package size={12} /> {selected.quantity} {selected.quantity_unit}
                  </span>
                  {selected.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {selected.location}
                    </span>
                  )}
                  {selected.price_per_unit != null && (
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{selected.price_per_unit}/{selected.quantity_unit.replace(/s$/, "")}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {report ? (
                <GradeReportCard report={report} imageUrl={imageUrl(selected.image_url)} />
              ) : (
                <div className="py-10 text-center text-stone-400">
                  {detailLoading ? (
                    <Loader2 size={24} className="mx-auto animate-spin" />
                  ) : (
                    "Grade report unavailable."
                  )}
                </div>
              )}

              {selected.description && <div className="rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700 dark:bg-stone-800 dark:text-stone-300"><h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">About this harvest</h3>{selected.description}</div>}
              {selected.harvest_date && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Harvest / storage: {selected.harvest_date}
                </p>
              )}

              {/* Seller + inquiry */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-extrabold">
                    {(selected.seller_name || "F")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selected.seller_name || "Farmer"}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {selected.seller_location || selected.location || "India"}
                      {selected.seller_phone ? ` · 📞 ${selected.seller_phone}` : ""}
                    </p>
                  </div>
                </div>

                {sent ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 rounded-xl">
                    <CheckCircle2 size={16} />
                    Inquiry sent! The farmer will see your message and contact details.
                  </div>
                ) : selected.seller_id === user?.id ? (
                  <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">This is your listing. Buyers can contact you through the marketplace.</p>
                ) : !isLoggedIn ? (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                    <p className="text-sm text-sky-950 dark:text-sky-100">Sign in to send this farmer an inquiry.</p>
                    <Link to="/login" state={{ from: location.pathname }} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white hover:bg-sky-900">Sign in to enquire</Link>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); setInquiryError(""); }}
                      rows={3}
                      placeholder="e.g. Interested in 20 quintals. Please share your best price and delivery options."
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm font-medium bg-stone-50/60 dark:bg-stone-800/40 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={submitInquiry}
                      disabled={sending}
                      className="mt-3 inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
                    >
                      {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      Send Inquiry
                    </button>
                  </>
                )}
                {inquiryError && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">{inquiryError}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
