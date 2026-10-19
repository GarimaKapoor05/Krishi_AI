import React, { useState, useEffect } from "react";
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  AlertTriangle,
  Info,
  RefreshCw,
  Compass
} from "lucide-react";
import { fetch7DayWeather } from "../../services/weatherService";

export function WeatherSection({ farmLocation }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const district = farmLocation?.district || "Ludhiana";
  const state = farmLocation?.state || "Punjab";

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await fetch7DayWeather(district, state);
      if (isMounted) {
        setWeatherData(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [district, state]);

  // Weather icon helper
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "CloudRain": return <CloudRain className="w-6 h-6 text-blue-500" />;
      case "CloudSun": return <CloudSun className="w-6 h-6 text-amber-500" />;
      case "Cloud": return <Cloud className="w-6 h-6 text-stone-400" />;
      case "Wind": return <Wind className="w-6 h-6 text-teal-500" />;
      default: return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
      {/* Section Title & Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-brand-border gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-brand-amber">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-sans">
              7-Day Agricultural Weather Forecast
            </h2>
            <p className="text-xs text-stone-500">
              Micro-climate conditions for <strong>{district}, {state}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-stone-400">
          <span>{weatherData?.dataSource || "Agro-Climatic Feed"}</span>
          <span>&bull;</span>
          <span>Updated {weatherData?.lastUpdated || "recently"}</span>
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-green" />
          <span>Fetching local agricultural weather data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          {weatherData?.days?.map((day, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={day.fullDate || idx}
                className={`p-3.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                  isToday
                    ? "border-brand-green bg-brand-mint/20 shadow-xs ring-1 ring-brand-green/20"
                    : "border-brand-border bg-brand-sand/50 hover:bg-white"
                }`}
              >
                <div>
                  <span
                    className={`block text-xs font-bold ${
                      isToday ? "text-brand-green" : "text-stone-700"
                    }`}
                  >
                    {day.day}
                  </span>
                  <span className="block text-[10px] text-stone-400 mb-2">
                    {day.date}
                  </span>

                  <div className="my-2 flex justify-center">
                    {renderIcon(day.icon)}
                  </div>

                  <span className="block text-[11px] font-semibold text-stone-700 line-clamp-1 mb-2">
                    {day.condition}
                  </span>
                </div>

                <div className="pt-2 border-t border-brand-border/60 text-xs">
                  <div className="flex items-center justify-center space-x-1 font-bold text-stone-900">
                    <span>{day.maxTemp}°</span>
                    <span className="text-stone-400 font-normal">/ {day.minTemp}°</span>
                  </div>

                  <div className="mt-1 flex items-center justify-center space-x-1 text-[10px] text-blue-600 font-medium">
                    <Droplets className="w-3 h-3" />
                    <span>{day.rainProb}% rain</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weather Alerts & Farm Advisory */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <div className="space-y-2 mt-4 pt-3 border-t border-brand-border/60">
          {weatherData.alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                alert.type === "warning"
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              }`}
            >
              {alert.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="font-semibold block">{alert.title}</strong>
                <span className="text-[11px] leading-relaxed">{alert.advice}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
