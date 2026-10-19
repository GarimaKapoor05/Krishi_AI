import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  MapPin,
  IndianRupee,
  Loader2,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  Activity,
  LineChart,
  Sparkles,
  CheckCircle2,
  XCircle,
  Scale,
  Truck,
  CloudRain,
  Thermometer,
  Info,
  ArrowRight,
  Package,
  Gauge,
} from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  marketIntelCatalog,
  marketIntelAnalyze,
} from "../services/marketIntel";
import { apiError } from "../services/marketplace";

const HORIZONS = [7, 15, 30];

const DECISION_STYLES = {
  sell_now: {
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    icon: TrendingDown,
  },
  hold: {
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    icon: TrendingUp,
  },
  sell_partial: {
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    icon: Scale,
  },
  compare_markets: {
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    icon: MapPin,
  },
  insufficient_data: {
    color: "text-stone-600 dark:text-stone-300",
    bg: "bg-stone-100 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700",
    icon: AlertCircle,
  },
};

function inr(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function reliabilityColor(rating) {
  if (rating === "High") return "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50";
  if (rating === "Moderate") return "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50";
  return "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/50";
}

export default function MarketIntelligence() {
  const { t } = useTranslation();

  const [catalog, setCatalog] = useState([]);
  const [commodity, setCommodity] = useState("Wheat");
  const [market, setMarket] = useState("");
  const [quantity, setQuantity] = useState(50);
  const [horizon, setHorizon] = useState(7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState({ transport_cost: "", market_fee_pct: "" });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    marketIntelCatalog("Wheat")
      .then(({ data }) => {
        setCatalog(data.commodities || []);
        setMarket((data.markets && data.markets[0]) || "bhopal");
      })
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!commodity) return;
    marketIntelCatalog(commodity)
      .then(({ data }) => {
        const markets = data.markets || [];
        if (markets.length && !markets.some((m) => m.toLowerCase() === market.toLowerCase())) {
          setMarket(markets[0]);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commodity]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        commodity,
        market: market.toLowerCase(),
        quantity: Number(quantity) || 1,
        horizon_days: horizon,
      };
      if (advanced.transport_cost !== "") payload.transport_cost = Number(advanced.transport_cost);
      if (advanced.market_fee_pct !== "") payload.costs = { market_fee_pct: Number(advanced.market_fee_pct) };
      const { data } = await marketIntelAnalyze(payload);
      setResult(data);
    } catch (err) {
      setError(apiError(err, t("marketIntel.err", { defaultValue: "Unable to reach the market intelligence service." })));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const dsource = result?.data_source;
  const rec = result?.recommendation;
  const decisionStyle = DECISION_STYLES[rec?.decision] || DECISION_STYLES.insufficient_data;
  const DecisionIcon = decisionStyle.icon;

  const chartData = useMemo(() => {
    if (!result?.trend?.available) return [];
    const points = [];
    (result.trend.chart || []).slice(-60).forEach((p) => {
      points.push({ date: shortDate(p.date), price: p.price, ma7: p.ma7 });
    });
    const horizonPoints = result.forecast?.horizons?.[String(horizon)]?.points || [];
    horizonPoints.forEach((p) => {
      points.push({
        date: shortDate(p.date),
        forecast: p.price,
        lower: p.lower,
        upper: p.upper,
        band: Math.max(0, p.upper - p.lower),
      });
    });
    return points;
  }, [result, horizon]);

  const netReturnData = useMemo(() => {
    const n = rec?.net_returns || {};
    return [
      { name: t("marketIntel.sellNow", { defaultValue: "Sell now" }), value: n.sell_now, color: "#e11d48" },
      { name: t("marketIntel.holdCons", { defaultValue: "Hold (low)" }), value: n.hold_conservative, color: "#f59e0b" },
      { name: t("marketIntel.holdExp", { defaultValue: "Hold (exp.)" }), value: n.hold_expected, color: "#0ea5e9" },
      { name: t("marketIntel.holdOpt", { defaultValue: "Hold (high)" }), value: n.hold_optimistic, color: "#059669" },
    ].filter((d) => d.value !== null && d.value !== undefined);
  }, [rec, t]);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-300/60 dark:border-teal-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
            <Activity className="w-4 h-4" />
            <span>{t("marketIntel.badge", { defaultValue: "AGMARKNET + Open-Meteo Market Intelligence" })}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {t("marketIntel.title", { defaultValue: "Sell, Hold or Compare Markets?" })}
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            {t("marketIntel.desc", {
              defaultValue:
                "Trend analysis, 7/15/30-day forecasts and net-return decisions — factoring storage, transport, quality loss and perishability. Every number shows its data source.",
            })}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-card border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{t("marketIntel.params", { defaultValue: "Market Intelligence Parameters" })}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{t("marketIntel.paramsDesc", { defaultValue: "Choose crop, market, lot size and decision horizon." })}</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                  <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("marketIntel.crop", { defaultValue: "Commodity" })}
                </label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {(catalog.length ? catalog : [commodity]).map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-stone-900">{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("marketIntel.market", { defaultValue: "Market" })}
                </label>
                <input
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="bhopal"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                  <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("marketIntel.quantity", { defaultValue: "Quantity (quintals)" })}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 bg-stone-50/50 dark:bg-stone-800/40 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                  <Gauge className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {t("marketIntel.horizon", { defaultValue: "Decision horizon" })}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {HORIZONS.map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`py-3 rounded-2xl text-sm font-bold border transition ${
                        horizon === h
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200"
                      }`}
                    >
                      {h}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5"
            >
              <Truck size={14} />
              {showAdvanced
                ? t("marketIntel.hideCosts", { defaultValue: "Hide cost assumptions" })
                : t("marketIntel.showCosts", { defaultValue: "Adjust cost assumptions (optional)" })}
            </button>

            {showAdvanced && (
              <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Transport cost (₹/quintal, total)</label>
                  <input
                    type="number"
                    min="0"
                    value={advanced.transport_cost}
                    onChange={(e) => setAdvanced({ ...advanced, transport_cost: e.target.value })}
                    placeholder="auto / 0"
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 bg-white dark:bg-stone-900 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Market fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={advanced.market_fee_pct}
                    onChange={(e) => setAdvanced({ ...advanced, market_fee_pct: e.target.value })}
                    placeholder="2"
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 bg-white dark:bg-stone-900 text-sm"
                  />
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 flex items-end pb-1">
                  Storage &amp; spoilage defaults are derived from crop shelf life.
                </div>
              </div>
            )}

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                {t("marketIntel.note", { defaultValue: "Live mandi prices require a data.gov.in key; weather is always live." })}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[260px] bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-black text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{t("marketIntel.analyzing", { defaultValue: "Analysing market..." })}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{t("marketIntel.analyze", { defaultValue: "Run Market Analysis" })}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {error && (
          <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5 flex gap-3 text-red-800 dark:text-red-300">
            <AlertCircle size={22} className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">{t("marketIntel.errorTitle", { defaultValue: "Analysis error" })}</h3>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Data source banner */}
            <div className={`max-w-4xl mx-auto rounded-2xl border p-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${
              dsource?.is_live
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}>
              <span className="flex items-center gap-1.5 font-bold">
                <Info size={14} />
                {dsource?.is_live ? t("marketIntel.live", { defaultValue: "Live data" }) : t("marketIntel.sample", { defaultValue: "Historical sample data" })}
              </span>
              <span>{dsource?.source}</span>
              {dsource?.last_updated && <span>• updated {dsource.last_updated.slice(0, 16).replace("T", " ")} UTC</span>}
              {dsource?.latest_trading_date && <span>• latest trade {dsource.latest_trading_date}</span>}
              <span>• {result.history_summary?.points} price points</span>
              {dsource?.note && <span className="w-full opacity-80">{dsource.note}</span>}
            </div>

            {/* Top stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4 text-emerald-800 dark:text-emerald-400">
                  <IndianRupee size={22} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t("marketIntel.current", { defaultValue: "Current price" })}</p>
                <h3 className="text-3xl font-black mt-1">{inr(result.current_price)}</h3>
                <p className="text-xs text-stone-400 mt-1">per quintal</p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4 text-blue-800 dark:text-blue-400">
                  {(result.trend?.daily_change_pct ?? 0) >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t("marketIntel.dailyChange", { defaultValue: "Daily change" })}</p>
                <h3 className={`text-3xl font-black mt-1 ${(result.trend?.daily_change_pct ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.trend?.daily_change_pct != null
                    ? `${result.trend.daily_change_pct > 0 ? "+" : ""}${result.trend.daily_change_pct}%`
                    : "—"}
                </h3>
                <p className="text-xs text-stone-400 mt-1">{result.trend?.trend?.direction ? `${result.trend.trend.direction} trend` : "—"}</p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center mb-4 text-purple-800 dark:text-purple-400">
                  <Activity size={22} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t("marketIntel.volatility", { defaultValue: "Volatility" })}</p>
                <h3 className="text-3xl font-black mt-1">{result.trend?.volatility?.level || "—"}</h3>
                <p className="text-xs text-stone-400 mt-1">
                  {result.trend?.volatility?.annualized_pct != null ? `${result.trend.volatility.annualized_pct}% annualized` : "—"}
                </p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-4 text-teal-800 dark:text-teal-400">
                  <ShieldCheck size={22} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t("marketIntel.reliability", { defaultValue: "Forecast reliability" })}</p>
                <h3 className="text-3xl font-black mt-1">{result.forecast?.reliability?.rating || "—"}</h3>
                <p className="text-xs text-stone-400 mt-1">{result.forecast?.model_label || "—"}</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-3xl border p-6 sm:p-8 shadow-card ${decisionStyle.bg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-white/70 dark:bg-stone-900/70 flex items-center justify-center ${decisionStyle.color}`}>
                    <DecisionIcon size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{t("marketIntel.recommendation", { defaultValue: "Recommendation" })}</p>
                    <h2 className={`text-2xl sm:text-3xl font-black ${decisionStyle.color}`}>{rec?.decision_label}</h2>
                    <p className="text-xs opacity-80 mt-0.5">
                      {t("marketIntel.confidence", { defaultValue: "Confidence" })}: {rec?.confidence} • {horizon}-day horizon
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">{t("marketIntel.netSellNow", { defaultValue: "Net if sold now" })}</p>
                  <p className="text-2xl font-black">{inr(rec?.net_returns?.sell_now)}</p>
                  <p className="text-xs opacity-80">
                    {t("marketIntel.expectedGain", { defaultValue: "Expected gain from holding" })}: {inr(rec?.net_returns?.expected_gain)}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mt-6">
                <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" />{t("marketIntel.why", { defaultValue: "Why" })}</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed">
                    {(rec?.reasons || []).map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle size={14} className="text-rose-600" />{t("marketIntel.risks", { defaultValue: "Risks" })}</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed">
                    {(rec?.risks || []).map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Info size={14} className="text-sky-600" />{t("marketIntel.assumptions", { defaultValue: "Assumptions" })}</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed">
                    {(rec?.assumptions || []).map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Forecast chart */}
            {result.trend?.available && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h4 className="font-extrabold text-lg flex items-center gap-2">
                      <LineChart size={20} className="text-emerald-700 dark:text-emerald-400" />
                      {t("marketIntel.chartTitle", { defaultValue: "Historical prices & forecast band" })}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Solid line = actual/forecast; shaded band = 80% expected range.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ₹/Quintal
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <defs>
                        <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} minTickGap={24} />
                      <YAxis stroke="#9ca3af" fontSize={11} domain={["auto", "auto"]} />
                      <Tooltip
                        formatter={(val, name) => [inr(val), name]}
                        contentStyle={{ backgroundColor: "#1c1917", borderRadius: "16px", border: "none", color: "#fff", fontSize: "12px" }}
                      />
                      <Area dataKey="lower" stackId="band" stroke="none" fill="transparent" isAnimationActive={false} />
                      <Area dataKey="band" stackId="band" stroke="none" fill="url(#bandGrad)" isAnimationActive={false} name="80% range" />
                      <Line type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={2.5} dot={false} name="Price" connectNulls />
                      <Line type="monotone" dataKey="ma7" stroke="#d97706" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="7-day avg" connectNulls />
                      <Line type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="Forecast" connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Horizon forecast cards */}
            <div className="grid md:grid-cols-3 gap-5">
              {HORIZONS.map((h) => {
                const f = result.forecast?.horizons?.[String(h)];
                return (
                  <div key={h} className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold">{h}-day forecast</span>
                      {f?.available ? (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${reliabilityColor(result.forecast?.reliability?.rating)}`}>
                          {result.forecast?.reliability?.rating}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">n/a</span>
                      )}
                    </div>
                    {f?.available ? (
                      <>
                        <h3 className="text-3xl font-black">{inr(f.expected_price)}</h3>
                        <p className={`text-sm font-bold mt-1 ${f.change_pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {f.change_pct > 0 ? "+" : ""}{f.change_pct}% vs today
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
                          Expected range: {inr(f.range_low)} – {inr(f.range_high)}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-1">by {f.target_date}</p>
                      </>
                    ) : (
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{f?.reason || "Not enough data."}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Net returns + scenarios */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                <h4 className="font-extrabold text-lg mb-1">{t("marketIntel.netTitle", { defaultValue: "Net returns by option" })}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">After transport, fees, handling, storage & spoilage.</p>
                {netReturnData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={netReturnData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                        <Tooltip formatter={(v) => inr(v)} contentStyle={{ backgroundColor: "#1c1917", borderRadius: "16px", border: "none", color: "#fff", fontSize: "12px" }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {netReturnData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400 py-10 text-center">Not enough data to compute net returns.</p>
                )}
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                <h4 className="font-extrabold text-lg mb-1">{t("marketIntel.scenarios", { defaultValue: "Scenario comparison" })}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">Estimated net return for {result.quantity} {result.unit}s.</p>
                <div className="space-y-3">
                  {Object.values(rec?.scenarios || {}).length > 0 ? (
                    Object.values(rec?.scenarios || {}).map((s, i) => {
                      const isBest = Math.max(...Object.values(rec?.scenarios || {}).map((x) => x.net_return || 0)) === s.net_return;
                      return (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${isBest ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/20" : "border-stone-200 dark:border-stone-800"}`}>
                          <div>
                            <p className="text-sm font-bold">{s.label}</p>
                            {s.storage_cost ? <p className="text-[11px] text-stone-500">Storage cost {inr(s.storage_cost)}</p> : null}
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${isBest ? "text-emerald-700 dark:text-emerald-300" : ""}`}>{inr(s.net_return)}</p>
                            {isBest && <p className="text-[10px] font-bold text-emerald-600 uppercase">Best</p>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-stone-500 dark:text-stone-400 py-10 text-center">No scenarios available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Market comparison */}
            {result.market_comparison?.ranked?.length > 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-extrabold text-lg flex items-center gap-2"><MapPin size={20} className="text-emerald-700 dark:text-emerald-400" />{t("marketIntel.marketCompare", { defaultValue: "Market comparison" })}</h4>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${result.market_comparison?.data_source?.is_live ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"}`}>
                    {result.market_comparison?.data_source?.is_live ? "Live" : "Sample"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">{result.market_comparison?.data_source?.source}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-stone-800">
                        <th className="py-3 pr-4">Market</th>
                        <th className="py-3 px-4">Price (₹/q)</th>
                        <th className="py-3 px-4">Transport*</th>
                        <th className="py-3 pl-4 text-right">Net return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.market_comparison.ranked.map((m, i) => {
                        const best = m.market === result.market_comparison.best_market;
                        return (
                          <tr key={i} className={`border-b border-stone-100 dark:border-stone-800/60 ${best ? "bg-emerald-50/60 dark:bg-emerald-950/20" : ""}`}>
                            <td className="py-3 pr-4 font-bold flex items-center gap-2">
                              {m.market}
                              {best && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">Best</span>}
                            </td>
                            <td className="py-3 px-4">{inr(m.price)}</td>
                            <td className="py-3 px-4 text-stone-500">{inr(m.transport_per_unit)}{m.transport_estimated ? " est." : ""}</td>
                            <td className={`py-3 pl-4 text-right font-black ${best ? "text-emerald-700 dark:text-emerald-300" : ""}`}>{inr(m.net_return)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {result.market_comparison.missing_info && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-3 flex items-center gap-1.5"><Info size={12} />{result.market_comparison.missing_info}</p>
                )}
              </div>
            )}

            {/* Weather + limitations */}
            <div className="grid lg:grid-cols-2 gap-6">
              {result.weather?.days?.length > 0 && (
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-700 dark:text-sky-400"><CloudRain size={20} /></div>
                    <div>
                      <h4 className="font-extrabold">{t("marketIntel.weather", { defaultValue: "Mandi weather (Open-Meteo)" })}</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Transport & spoilage context</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.weather.days.slice(0, 6).map((d, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                        <p className="text-[11px] font-semibold text-stone-500">{shortDate(d.date)}</p>
                        <p className="text-sm font-bold flex items-center gap-1 mt-1"><Thermometer size={13} className="text-amber-600" />{d.temp_max_c}° / {d.temp_min_c}°</p>
                        <p className="text-[11px] text-sky-600 mt-0.5">💧 {d.rainfall_mm} mm</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-card">
                <h4 className="font-extrabold flex items-center gap-2 mb-4"><AlertCircle size={18} className="text-amber-600" />{t("marketIntel.limitations", { defaultValue: "Model & data limitations" })}</h4>
                <ul className="space-y-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {(result.forecast?.limitations || []).map((l, i) => <li key={i}>• {l}</li>)}
                  {result.forecast?.reliability?.reason && <li>• {result.forecast.reliability.reason}</li>}
                  <li>• Mandi fees, transport and spoilage are estimates; verify locally before selling.</li>
                </ul>
                {result.forecast?.backtest && (
                  <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
                    <div><p className="text-[10px] uppercase font-bold text-stone-400">MAE</p><p className="text-sm font-black">{result.forecast.backtest.mae}</p></div>
                    <div><p className="text-[10px] uppercase font-bold text-stone-400">RMSE</p><p className="text-sm font-black">{result.forecast.backtest.rmse}</p></div>
                    <div><p className="text-[10px] uppercase font-bold text-stone-400">MAPE</p><p className="text-sm font-black">{result.forecast.backtest.mape ?? "—"}%</p></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
