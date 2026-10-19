import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Building2,
  Sparkles
} from "lucide-react";
import {
  INDIAN_MANDIS,
  generate7DayPriceHistory,
  fetchPriceForecast
} from "../../services/mandiPriceService";

export function MandiPriceSection({
  activeCrop = "Wheat",
  farmLocation,
  onNavigate
}) {
  const [selectedCrop, setSelectedCrop] = useState(activeCrop);
  const [selectedMandiId, setSelectedMandiId] = useState("punjab_khanna");
  const [marketData, setMarketData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync with active crop if changed from parent
  useEffect(() => {
    if (activeCrop) {
      setSelectedCrop(activeCrop);
    }
  }, [activeCrop]);

  // Load 7-day price data
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = generate7DayPriceHistory(selectedCrop, selectedMandiId);
      if (isMounted) {
        setMarketData(data);
        setLoading(false);
      }

      // Fetch forecast in background
      const recentPrices = data.history.map((h) => h.modalPrice);
      const fc = await fetchPriceForecast(selectedCrop, recentPrices);
      if (isMounted) {
        setForecast(fc);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedCrop, selectedMandiId]);

  const history = marketData?.history || [];
  const modalPrices = history.map((h) => h.modalPrice);
  const minChartPrice = Math.min(...modalPrices, marketData?.latestMinPrice || 2000) - 30;
  const maxChartPrice = Math.max(...modalPrices, marketData?.latestMaxPrice || 2600) + 30;
  const priceRange = Math.max(1, maxChartPrice - minChartPrice);

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-brand-border gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-brand-green">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-sans">
              7-Day APMC Mandi Price Intelligence
            </h2>
            <p className="text-xs text-stone-500">
              Live spot rates and arrival trends for <strong>{marketData?.cropDisplayName || selectedCrop}</strong>
            </p>
          </div>
        </div>

        {/* Mandi & Crop Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Crop Selector */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-brand-border text-xs font-semibold bg-white text-stone-800 outline-none focus:border-brand-green"
          >
            <option value="Wheat">Wheat (गेहूं)</option>
            <option value="Rice">Rice / Paddy (धान)</option>
            <option value="Cotton">Cotton (कपास)</option>
            <option value="Maize">Maize (मक्का)</option>
            <option value="Mustard">Mustard (सरसों)</option>
            <option value="Potato">Potato (आलू)</option>
            <option value="Soybean">Soybean (सोयाबीन)</option>
          </select>

          {/* Mandi Selector */}
          <select
            value={selectedMandiId}
            onChange={(e) => setSelectedMandiId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-brand-border text-xs font-semibold bg-white text-stone-800 outline-none focus:border-brand-green max-w-[200px]"
          >
            {INDIAN_MANDIS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-green" />
          <span>Loading mandi spot rates...</span>
        </div>
      ) : (
        <div>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-brand-sand border border-brand-border">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Latest Modal Rate
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  ₹{marketData?.latestModalPrice?.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">/ Qtl</span>
              </div>
              <div className="flex items-center space-x-1 mt-1 text-[11px]">
                {marketData?.sevenDayPctChange >= 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{marketData?.sevenDayPctChange}%
                  </span>
                ) : (
                  <span className="text-red-600 font-bold flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {marketData?.sevenDayPctChange}%
                  </span>
                )}
                <span className="text-stone-400">(7-day net)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-brand-border">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Daily Price Range
              </span>
              <div className="mt-1 flex items-baseline space-x-1 text-sm font-bold text-stone-800">
                <span>₹{marketData?.latestMinPrice}</span>
                <span className="text-stone-400 font-normal text-xs">–</span>
                <span>₹{marketData?.latestMaxPrice}</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-1">
                {marketData?.msp ? `MSP: ₹${marketData.msp}` : "No official MSP"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-brand-border">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Daily Arrivals
              </span>
              <div className="mt-1 text-sm font-bold text-stone-800">
                {marketData?.latestArrivals} Metric Tonnes
              </div>
              <span className="text-[10px] text-stone-400 block mt-1">
                Steady APMC auction flow
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-brand-border">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Market Location
              </span>
              <div className="mt-1 text-xs font-bold text-stone-800 flex items-center space-x-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span className="truncate">{marketData?.mandi?.district}, {marketData?.mandi?.state}</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-1">
                ~{marketData?.mandi?.distanceKm || 20} km from your farm
              </span>
            </div>
          </div>

          {/* 7-Day Price Trend SVG Chart */}
          <div className="p-4 rounded-xl bg-brand-sand/40 border border-brand-border mb-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-stone-800">
                7-Day Price Trend Curve (Modal Price)
              </span>
              <span className="text-[11px] text-stone-400">
                Historical Spot Rates
              </span>
            </div>

            {/* Responsive SVG Sparkline */}
            <div className="h-32 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="700" y2="20" stroke="#E7E5DC" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="60" x2="700" y2="60" stroke="#E7E5DC" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#E7E5DC" strokeDasharray="4 4" strokeWidth="1" />

                {/* Plot Area Polyline */}
                {(() => {
                  const points = history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 680 + 10;
                    const y = 100 - ((h.modalPrice - minChartPrice) / priceRange) * 85;
                    return `${x},${y}`;
                  }).join(" ");

                  const fillPoints = `10,120 ${points} 690,120`;

                  return (
                    <>
                      <polygon points={fillPoints} fill="#d8f3dc" opacity="0.4" />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#1b4332"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {history.map((h, i) => {
                        const x = (i / (history.length - 1)) * 680 + 10;
                        const y = 100 - ((h.modalPrice - minChartPrice) / priceRange) * 85;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                            <text
                              x={x}
                              y={y - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#292524"
                            >
                              ₹{h.modalPrice}
                            </text>
                            <text
                              x={x}
                              y="118"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#78716c"
                            >
                              {h.displayDate}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* AI Price Forecast Preview (Truthfully distinguishing forecast vs observed) */}
          {forecast && (
            <div className="p-3.5 rounded-xl bg-white border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-4">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-brand-amber shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900">
                      AI Price Forecast ({forecast.forecastHorizon || "Next 7 Days"}):
                    </span>
                    <span className="font-extrabold text-brand-green">
                      ₹{forecast.forecasted_price} / Qtl
                    </span>
                    <span className="text-[10px] text-stone-400">({forecast.trend} Trend)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                    {forecast.recommendation} &bull; {forecast.outlook}
                  </p>
                </div>
              </div>

              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-500 shrink-0 self-start sm:self-center">
                Predicted Model
              </span>
            </div>
          )}

          {/* Footer & Link to Full Feature */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-brand-border text-xs gap-3">
            <span className="text-[11px] text-stone-400">
              Source: {marketData?.sourceAttribution} &bull; {marketData?.lastUpdated}
            </span>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("market")}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-green hover:underline hover:text-brand-emerald"
            >
              <span>Explore Full Market Intelligence &amp; Multi-Mandi Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
