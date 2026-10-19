import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Inbox,
  Loader2,
  MapPin,
  Package,
  Pause,
  Play,
  PlusCircle,
  Sprout,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getFarmCrop, getFarmLocationLabel, readFarmProfile } from "../services/farmProfile";
import GradeBadge from "../components/GradeBadge";
import GradeReportCard from "../components/GradeReportCard";
import {
  apiError,
  buildListingForm,
  createListing,
  deleteListing,
  gradePhoto,
  imageUrl,
  marketplaceStats,
  myListings,
  receivedInquiries,
  updateListing,
} from "../services/marketplace";

const EMPTY_FORM = {
  cropName: "",
  variety: "",
  quantity: "",
  quantityUnit: "Quintals",
  farmerGrade: "",
  harvestDate: "",
  location: "",
  pricePerUnit: "",
  imageFile: null,
};

const QUANTITY_UNITS = ["Quintals", "Tonnes", "Kg", "Crates", "Bags"];

function newListingForm() {
  const profile = readFarmProfile();
  return { ...EMPTY_FORM, cropName: getFarmCrop(profile), location: getFarmLocationLabel(profile) };
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
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

export default function SellerDashboard() {
  const { user } = useAuth();

  const [tab, setTab] = useState("new");
  const [form, setForm] = useState(newListingForm);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [grading, setGrading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const flash = (msg) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled([
        myListings(),
        receivedInquiries(),
        marketplaceStats(),
      ]);
      const [mine, inquiryData, statsData] = results;
      if (mine.status === "fulfilled") setListings(mine.value.data.items || []);
      if (inquiryData.status === "fulfilled") setInquiries(inquiryData.value.data.items || []);
      if (statsData.status === "fulfilled") setStats(statsData.value.data);
      const rejected = results.find((result) => result.status === "rejected");
      if (rejected) setError(apiError(rejected.reason, "Some seller information could not be loaded."));
    } catch (err) {
      setError(apiError(err, "Could not load your dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setField("imageFile", file);
    setPreviewReport(null);
  };

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewReport(null);
    setForm(newListingForm());
  };

  const runGradePreview = async () => {
    setError("");
    if (!form.cropName.trim()) {
      setError("Please enter the crop name before grading.");
      return;
    }
    if (!form.imageFile) {
      setError("Please choose a harvest photo to grade.");
      return;
    }
    setGrading(true);
    try {
      const res = await gradePhoto(buildListingForm(form));
      setPreviewReport(res.data);
    } catch (err) {
      setError(apiError(err, "Could not grade this photo."));
    } finally {
      setGrading(false);
    }
  };

  const publishListing = async () => {
    setError("");
    if (!form.cropName.trim() || !form.quantity) {
      setError("Crop name and quantity are required to publish.");
      return;
    }
    if (!form.imageFile) {
      setError("A harvest photo is required to publish a listing.");
      return;
    }
    setPublishing(true);
    try {
      const res = await createListing(buildListingForm(form));
      setPreviewReport(res.data.grade_report);
      resetForm();
      await refresh();
      setTab("listings");
      flash("Listing published successfully.");
    } catch (err) {
      setError(apiError(err, "Could not publish this listing."));
    } finally {
      setPublishing(false);
    }
  };

  const changeStatus = async (listing, status) => {
    try {
      const res = await updateListing(listing.id, { status });
      setListings((rows) =>
        rows.map((r) => (r.id === listing.id ? res.data.listing : r))
      );
      refresh();
    } catch (err) {
      setError(apiError(err, "Could not update the listing."));
    }
  };

  const removeListing = async (listing) => {
    if (!window.confirm(`Delete the listing for ${listing.crop_name}? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteListing(listing.id);
      setListings((rows) => rows.filter((r) => r.id !== listing.id));
      refresh();
      flash("Listing deleted.");
    } catch (err) {
      setError(apiError(err, "Could not delete the listing."));
    }
  };

  const sellerStats = stats?.seller || {};

  const activeCount = useMemo(
    () => listings.filter((l) => l.status === "active").length,
    [listings]
  );

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3 py-1 rounded-full mb-3">
              <Sprout size={14} />
              Seller Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, <span className="break-all">{user?.username || "Farmer"}</span> 👋
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
              Photograph your harvest, get an AI-assisted grade, and reach buyers directly.
            </p>
          </div>
          <button
            onClick={() => setTab("new")}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/10 transition"
          >
            <PlusCircle size={16} />
            New Listing
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Package}
            label="Active listings"
            value={loading ? "—" : sellerStats.my_active ?? activeCount}
            tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          />
          <StatCard
            icon={CheckCircle2}
            label="Sold lots"
            value={loading ? "—" : sellerStats.my_sold ?? 0}
            tone="bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
          />
          <StatCard
            icon={Inbox}
            label="Buyer inquiries"
            value={loading ? "—" : sellerStats.my_inquiries ?? inquiries.length}
            tone="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg grade confidence"
            value={sellerStats.avg_confidence ? `${sellerStats.avg_confidence}%` : "—"}
            tone="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
          />
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-950 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100" role="alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            {error.includes("Sign in again") && <Link to="/login" className="shrink-0 font-bold underline underline-offset-2">Sign in</Link>}
            <button className="ml-auto" onClick={() => setError("")} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        )}
        {notice && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-2xl text-sm font-semibold">
            <CheckCircle2 size={16} />
            {notice}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800">
          {[
            { key: "new", label: "New Listing" },
            { key: "listings", label: `My Listings (${listings.length})` },
            { key: "inquiries", label: `Inquiries (${inquiries.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition ${
                tab === t.key
                  ? "text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "text-stone-500 dark:text-stone-400 hover:text-emerald-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── New Listing Tab ── */}
        {tab === "new" && (
        <div className="grid lg:grid-cols-12 gap-5 xl:gap-6 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-lg font-extrabold">Harvest details</h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Crop name *">
                  <input
                    value={form.cropName}
                    onChange={(e) => setField("cropName", e.target.value)}
                    placeholder="e.g. Red Onion"
                    className="input-base"
                  />
                </Field>
                <Field label="Variety">
                  <input
                    value={form.variety}
                    onChange={(e) => setField("variety", e.target.value)}
                    placeholder="e.g. Nashik Red"
                    className="input-base"
                  />
                </Field>
                <Field label="Quantity *">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    placeholder="e.g. 50"
                    className="input-base"
                  />
                </Field>
                <Field label="Unit">
                  <select
                    value={form.quantityUnit}
                    onChange={(e) => setField("quantityUnit", e.target.value)}
                    className="input-base"
                  >
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Your stated grade (optional)">
                  <select
                    value={form.farmerGrade}
                    onChange={(e) => setField("farmerGrade", e.target.value)}
                    className="input-base"
                  >
                    <option value="">Not specified</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </Field>
                <Field label="Asking price per unit (₹, optional)">
                  <input
                    type="number"
                    min="0"
                    value={form.pricePerUnit}
                    onChange={(e) => setField("pricePerUnit", e.target.value)}
                    placeholder="e.g. 2400"
                    className="input-base"
                  />
                </Field>
                <Field label="Harvest / storage info">
                  <input
                    value={form.harvestDate}
                    onChange={(e) => setField("harvestDate", e.target.value)}
                    placeholder="e.g. Harvested 3 days ago, cured in shade"
                    className="input-base"
                  />
                </Field>
                <Field label="Farm / Mandi location">
                  <input
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="e.g. Nashik, Maharashtra"
                    className="input-base"
                  />
                </Field>
              </div>

              {/* Photo picker */}
              <div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Harvest photo *
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-5 text-center cursor-pointer hover:border-emerald-500 transition">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={onPickImage}
                      className="hidden"
                    />
                    <Upload size={22} className="mx-auto text-emerald-600" />
                    <p className="text-sm font-semibold mt-2">
                      {form.imageFile ? form.imageFile.name : "Choose a photo"}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      JPG, PNG or WEBP · up to 8 MB
                    </p>
                  </label>

                  {previewUrl && (
                    <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          setField("imageFile", null);
                          setPreviewReport(null);
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                        aria-label="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={runGradePreview}
                  disabled={grading}
                  className="inline-flex items-center gap-2 border border-emerald-700 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition disabled:opacity-60"
                >
                  {grading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  Get AI Grade
                </button>
                <button
                  onClick={publishListing}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/10 transition disabled:opacity-60"
                >
                  {publishing ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  Publish Listing
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl font-bold text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Report preview column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 rounded-2xl p-4 text-xs text-stone-600 dark:text-stone-300">
                <p className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                  How grading works
                </p>
                <p>
                  Every listing is graded A / B / C by an AI-assisted visual check of your
                  photo. It is a quality guide, not a lab or government certificate. Clear,
                  well-lit photos produce more confident grades and better prices.
                </p>
              </div>

              {previewReport ? (
                <GradeReportCard report={previewReport} imageUrl={previewUrl} />
              ) : (
                <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-8 text-center text-stone-400">
                  <Camera size={26} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">
                    Add a photo and press “Get AI Grade” to see the bilingual quality report.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── My Listings Tab ── */}
        {tab === "listings" && (
          <div>
            {loading ? (
              <p className="text-sm text-stone-400">Loading your listings…</p>
            ) : listings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No listings yet"
                body="Publish your first harvest lot to start receiving buyer inquiries."
                action={
                  <button
                    onClick={() => setTab("new")}
                    className="inline-flex items-center gap-2 bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
                  >
                    <PlusCircle size={15} /> Create listing
                  </button>
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col"
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
                          <Camera size={24} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <GradeBadge grade={l.grade} confidence={l.confidence_score} size="sm" />
                      </div>
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          l.status === "active"
                            ? "bg-emerald-600 text-white"
                            : l.status === "sold"
                              ? "bg-sky-600 text-white"
                              : "bg-stone-600 text-white"
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="font-extrabold text-stone-900 dark:text-white">
                        {l.crop_name}
                        {l.variety ? (
                          <span className="font-medium text-stone-400"> · {l.variety}</span>
                        ) : null}
                      </h3>
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
                      {l.price_per_unit != null && (
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{l.price_per_unit} / {l.quantity_unit.replace(/s$/, "")}
                        </p>
                      )}
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {l.inquiry_count} inquir{l.inquiry_count === 1 ? "y" : "ies"}
                      </p>

                      <div className="mt-auto flex items-center gap-2 pt-2">
                        {l.status === "active" ? (
                          <button
                            onClick={() => changeStatus(l, "paused")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            <Pause size={13} /> Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => changeStatus(l, "active")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            <Play size={13} /> Activate
                          </button>
                        )}
                        {l.status !== "sold" && (
                          <button
                            onClick={() => changeStatus(l, "sold")}
                            className="text-xs font-bold px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            Mark sold
                          </button>
                        )}
                        <button
                          onClick={() => removeListing(l)}
                          className="ml-auto text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-lg"
                          aria-label="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Inquiries Tab ── */}
        {tab === "inquiries" && (
          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No buyer inquiries yet"
                body="When buyers are interested in your listing, their messages appear here with contact details."
              />
            ) : (
              inquiries.map((i) => (
                <div
                  key={i.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-extrabold">
                    {(i.buyer_name || "B")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-white">
                      {i.buyer_name || "Buyer"} ·{" "}
                      <span className="font-medium text-stone-400">{i.crop_name}</span>
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                      “{i.message}”
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1 flex gap-3 flex-wrap">
                      {i.buyer_phone && <span>📞 {i.buyer_phone}</span>}
                      {i.buyer_email && <span>✉️ {i.buyer_email}</span>}
                      {i.buyer_location && <span>📍 {i.buyer_location}</span>}
                      <span>
                        {i.created_at ? new Date(i.created_at).toLocaleString("en-IN") : ""}
                      </span>
                    </p>
                  </div>
                  {i.grade && <GradeBadge grade={i.grade} size="sm" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(214 211 209);
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          font-weight: 600;
          background: rgb(250 250 249);
          color: rgb(28 25 23);
          outline: none;
        }
        .input-base:focus { box-shadow: 0 0 0 2px rgba(16,185,129,0.45); background: #fff; }
        .dark .input-base {
          border-color: rgb(68 64 60);
          background: rgba(41 37 36 / 0.5);
          color: #fff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold text-stone-700 dark:text-stone-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-10 text-center">
      <Icon size={28} className="mx-auto text-stone-400 mb-3" />
      <h3 className="font-extrabold text-stone-900 dark:text-white">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
