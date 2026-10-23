import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, MapPin, Package, ShieldCheck, Sprout } from "lucide-react";
import { adminListings, apiError, createAdminListing, imageUrl } from "../services/marketplace";

const EMPTY = {
  seller_name: "",
  seller_phone: "",
  crop_name: "",
  variety: "",
  description: "",
  quantity: "",
  quantity_unit: "Quintals",
  price_per_unit: "",
  harvest_date: "",
  location: "",
};

const fields = [
  ["seller_name", "Farmer name *", "e.g. Ramesh Kumar"],
  ["seller_phone", "Farmer phone *", "Consent required before publishing"],
  ["crop_name", "Crop *", "e.g. Tomato"],
  ["variety", "Variety", "e.g. Hybrid"],
  ["quantity", "Available quantity *", ""],
  ["price_per_unit", "Farmer's asking price (₹) *", ""],
  ["harvest_date", "Harvest date / readiness", "e.g. Ready this week"],
  ["location", "Village, district, state *", "e.g. Kolar, Karnataka"],
];

export default function AdminListings() {
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [consent, setConsent] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminListings();
      setRows(response.data.items || []);
      setError("");
    } catch (err) {
      setError(apiError(err, "Could not load admin-managed offers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!image) return setError("Upload a real photo of the farmer's crop or harvest.");
    if (!consent) return setError("Confirm that the farmer agreed to publish this offer and contact number.");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append("seller_consent", "true");
    body.append("image", image);
    setSaving(true);
    try {
      await createAdminListing(body);
      setForm(EMPTY);
      setImage(null);
      setConsent(false);
      setNotice("The farmer's offer is now published.");
      await refresh();
    } catch (err) {
      setError(apiError(err, "Could not publish this offer."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-light px-4 pb-16 pt-24 text-stone-900 dark:bg-bg-dark dark:text-stone-100 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"><ShieldCheck size={14} /> ADMIN MARKETPLACE</div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Publish a farmer’s real offer</h1>
            <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">Enter an offer confirmed directly with the farmer. Mandi prices are market references; they are never used as a farmer’s asking price.</p>
          </div>
          <Link to="/marketplace" className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold dark:border-stone-700">View marketplace</Link>
        </header>

        {(error || notice) && <div role={error ? "alert" : "status"} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${error ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}{error || notice}</div>}

        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-7">
            <div>
              <h2 className="text-lg font-extrabold">Farmer and produce details</h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Use the farmer’s actual quantity, location, photo, and agreed asking price.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([name, label, placeholder]) => (
                <label key={name} className="space-y-1.5 text-sm font-semibold">
                  <span>{label}</span>
                  <input
                    required={label.includes("*")}
                    type={name === "quantity" || name === "price_per_unit" ? "number" : "text"}
                    min={name === "quantity" || name === "price_per_unit" ? "0.01" : undefined}
                    step={name === "quantity" || name === "price_per_unit" ? "0.01" : undefined}
                    value={form[name]}
                    onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-emerald-950"
                  />
                </label>
              ))}
              <label className="space-y-1.5 text-sm font-semibold">
                <span>Quantity unit</span>
                <select value={form.quantity_unit} onChange={(event) => setForm((current) => ({ ...current, quantity_unit: event.target.value }))} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-700 dark:bg-stone-950">
                  {["Quintals", "Tonnes", "Kg", "Crates", "Bags"].map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-semibold sm:col-span-2">
                <span>Offer description *</span>
                <textarea required minLength={20} maxLength={1000} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe crop quality, packaging, harvest timing, and pickup or delivery details." className="w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm dark:border-stone-700 dark:bg-stone-950" />
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 p-4 text-sm font-semibold dark:border-stone-700 sm:col-span-2">
                <ImagePlus className="shrink-0 text-emerald-700" size={20} />
                <span className="min-w-0 flex-1">{image?.name || "Upload a real crop / harvest photo *"}<small className="mt-0.5 block text-xs font-normal text-stone-500">JPG, PNG, or WEBP · up to 8 MB</small></span>
                <input type="file" accept="image/jpeg,image/png,image/webp" required={!image} onChange={(event) => setImage(event.target.files?.[0] || null)} className="w-28 text-xs" />
              </label>
              <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-100 sm:col-span-2">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 accent-emerald-700" />
                <span>I confirm the farmer authorized publication of this crop photo, offer details, and phone number. I have confirmed the quantity and asking price with them.</span>
              </label>
            </div>
            <button disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900 disabled:opacity-60 sm:w-auto">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Sprout size={18} />}{saving ? "Publishing…" : "Publish real farmer offer"}
            </button>
          </form>

          <section className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-7">
            <h2 className="text-lg font-extrabold">Offers you published</h2>
            {loading ? <div className="flex items-center gap-2 py-6 text-sm text-stone-500"><Loader2 size={17} className="animate-spin" />Loading offers…</div> : rows.length ? rows.map((row) => (
              <article key={row.id} className="flex gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-800">
                {row.image_url ? <img src={imageUrl(row.image_url)} alt={row.crop_name} className="h-20 w-24 rounded-xl object-cover" /> : <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800"><Package size={20} /></div>}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{row.crop_name}{row.variety ? ` · ${row.variety}` : ""}</p>
                  <p className="text-xs text-stone-500">{row.seller_name} · {row.quantity} {row.quantity_unit}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin size={12} />{row.location}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">₹{row.price_per_unit} / {row.quantity_unit}</p>
                </div>
              </article>
            )) : <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-stone-700">No admin-published offers yet. They’ll appear here after publication.</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
