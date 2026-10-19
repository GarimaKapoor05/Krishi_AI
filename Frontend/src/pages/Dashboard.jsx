import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  CloudRain,
  Sprout,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Droplets,
  LineChart,
  Landmark,
  Store,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getFarmWeather } from "../services/weatherLocation";
import { buildCropCalendar, calendarDateKey, parseCalendarDate } from "../services/cropCalendar";
import CropCalendar from "../components/CropCalendar";

const PROFILE_KEY = "krishi_farm_profile_v2";

const formatDate = (value) => {
  const date = typeof value === "string" ? parseCalendarDate(value) : value;
  return date?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || "Not set";
};
const displayValue = (value) => value ? value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not provided";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [weatherState, setWeatherState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [weatherRetryCount, setWeatherRetryCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Load saved farm profile from onboarding
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        setProfile(JSON.parse(raw));
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  // Resolve the farm's actual district/state; never substitute a different city.
  const farmLocation = profile?.farmLocation?.district
    ? profile.farmLocation
    : { district: "", state: "" };
  const weatherDistrict = farmLocation.district;
  const weatherStateName = farmLocation.state;
  const districtName = weatherDistrict || "your farm";

  useEffect(() => {
    let isMounted = true;
    setWeatherState({ loading: true, data: null, error: null });

    getFarmWeather({ district: weatherDistrict, state: weatherStateName })
      .then((data) => {
        if (isMounted) {
          setWeatherState({
            loading: false,
            data,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setWeatherState({
            loading: false,
            data: null,
            error: err.message || "Weather data is currently unavailable.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [weatherDistrict, weatherStateName, weatherRetryCount]);

  // Farmer's name
  const farmerName =
    profile?.account?.firstName
      ? `${profile.account.firstName} ${profile.account.lastName || ""}`.trim()
      : user?.username || user?.name || "Farmer";

  // Location display
  const locationText =
    [profile?.farmLocation?.village, profile?.farmLocation?.district, profile?.farmLocation?.state]
      .filter(Boolean)
      .join(", ") || user?.location || "India";

  // Determine active vs planning crop details
  const isCultivating = profile?.farmingStatus === "active";
  const isPlanning = profile?.farmingStatus === "planning";

  const cropName = isCultivating
    ? profile?.activeFarming?.cropName || null
    : isPlanning
    ? profile?.planningFarming?.primaryCrop || profile?.planningFarming?.interestedCrops?.[0] || profile?.planningFarming?.cropRecommendation?.recommended_crop || null
    : null;

  const rawSowingDate = profile?.activeFarming?.sowingDate;
  const plannedPeriod = profile?.planningFarming?.plannedSowingPeriod;
  const cropCalendar = buildCropCalendar({ cropName, isCultivating, sowingDate: rawSowingDate, plannedDate: plannedPeriod });
  const todayKey = calendarDateKey(new Date());
  const nextMilestone = cropCalendar.events.find((event) => event.date >= todayKey);
  const nextMilestoneDate = nextMilestone ? parseCalendarDate(nextMilestone.date) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysToNext = nextMilestoneDate ? Math.max(0, Math.ceil((nextMilestoneDate - today) / 86400000)) : null;

  // Determine practical next action
  const nextAction = (() => {
    if (!profile) {
      return {
        title: "Complete your farm profile",
        text: "Add your land size and active crop in onboarding to generate your personal crop calendar and next tasks.",
        link: "/onboarding",
        btnLabel: "Set up farm plan",
      };
    }
    return {
      title: nextMilestone ? `${nextMilestone.title} · ${formatDate(nextMilestone.date)}` : cropCalendar.events.length ? "Current crop cycle complete" : "Add a crop and planting date",
      text: nextMilestone ? `${daysToNext === 0 ? "Due today" : `In ${daysToNext} day${daysToNext === 1 ? "" : "s"}`} · ${nextMilestone.description}` : "Add your crop and planting date to build a date-based field calendar.",
      link: null,
      btnLabel: null,
    };
  })();

  return (
    <div className="pt-20 sm:pt-24 pb-12 min-h-screen bg-[#f7f7f2] dark:bg-[#0b1410] text-stone-900 dark:text-stone-100 transition-colors">
      <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">

        {/* ── Welcome Greeting & Location ── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full inline-block mb-2">
                Farmer Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Welcome back, {farmerName}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                <MapPin size={14} className="text-emerald-700 shrink-0" />
                <span>{locationText}</span>
              </p>
            </div>

            {profile ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {profile.farmLocation?.farmSize
                    ? `${profile.farmLocation.farmSize} ${profile.farmLocation.measurementUnit || "acres"}`
                    : "Farm size not provided"}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 capitalize">
                  {profile.farmLocation?.soilType && profile.farmLocation.soilType !== "unknown"
                    ? `${profile.farmLocation.soilType} soil`
                    : "Soil type not provided"}
                </span>
                <Link
                  to="/onboarding?edit=1"
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline px-2 py-1"
                >
                  Update profile
                </Link>
              </div>
            ) : (
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-sm hover:bg-emerald-900"
              >
                <span>Complete Onboarding</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Practical Next Action Banner ── */}
        <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={20} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                Crop timeline
              </p>
              <h2 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                {nextAction.title}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                {nextAction.text}
              </p>
            </div>
          </div>

          {nextAction.link && (
            <Link
              to={nextAction.link}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 shrink-0"
            >
              <span>{nextAction.btnLabel}</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* ── Crop Plan Summary Card ── */}
        {profile ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-700" />
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                  Your Crop Plan
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {isCultivating ? "Active Crop" : "Planned Season"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Crop</span>
                <span className="font-bold text-base text-stone-900 dark:text-white block mt-0.5 capitalize">
                  {cropName || "Not specified"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">
                  {isCultivating ? "Planting Date" : "Planned Period"}
                </span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5">
                  {isCultivating ? rawSowingDate ? formatDate(rawSowingDate) : "Recorded" : plannedPeriod ? formatDate(plannedPeriod) : "Upcoming"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">How You Water</span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5 capitalize">
                  {displayValue(profile.farmLocation?.irrigationSource)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Water Status</span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5 capitalize">
                  {displayValue(profile.farmLocation?.waterAvailability)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-center">
            <Sprout className="h-8 w-8 text-emerald-700 mx-auto mb-2" />
            <h3 className="font-bold text-base text-stone-900 dark:text-white">No crop plan recorded yet</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
              Complete onboarding to record your land size and crop plan, which will generate your personalized task schedule here.
            </p>
            <Link
              to="/onboarding"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-sm"
            >
              <span>Start Onboarding</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ── Interactive crop calendar and field agenda ── */}
        <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }} whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35 }}>
          <CropCalendar
            key={`${cropName || "no-crop"}-${rawSowingDate || plannedPeriod || "no-date"}`}
            cropName={cropName}
            isCultivating={isCultivating}
            sowingDate={rawSowingDate}
            plannedDate={plannedPeriod}
          />
        </motion.div>

        {/* ── Seven-Day Weather Section (Open-Meteo Integration) ── */}
        <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }} whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35 }} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-700" />
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                Local weather
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {weatherState.data?.locationName || districtName}
            </span>
          </div>

          {weatherState.data?.current && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sky-50/80 px-4 py-3 dark:bg-sky-950/25">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-800 dark:text-sky-300">Current conditions</p>
                <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300">
                  {weatherState.data.current.apparent_temperature != null && `Feels like ${Math.round(weatherState.data.current.apparent_temperature)}°C`}
                  {weatherState.data.current.relative_humidity_2m != null && ` · ${Math.round(weatherState.data.current.relative_humidity_2m)}% humidity`}
                  {weatherState.data.current.precipitation != null && ` · ${weatherState.data.current.precipitation} mm rain`}
                </p>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white" aria-label={`Current temperature ${Math.round(weatherState.data.current.temperature_2m)} degrees Celsius`}>
                {Math.round(weatherState.data.current.temperature_2m)}°<span className="text-sm font-medium">C now</span>
              </p>
            </div>
          )}

          {weatherState.loading && (
            <div className="py-10 text-center text-stone-500 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-emerald-700" />
              <span className="text-sm font-medium">Checking weather forecast for {districtName}...</span>
            </div>
          )}

          {weatherState.error && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-semibold">Weather service status</p>
                <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">{weatherState.error}</p>
                <button
                  type="button"
                  onClick={() => setWeatherRetryCount((count) => count + 1)}
                  className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
                >
                  <RefreshCw size={13} aria-hidden="true" /> Retry weather
                </button>
              </div>
            </div>
          )}

          {weatherState.data?.days && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weatherState.data.days.slice(0, 7).map((day, idx) => {
                  const dateObj = new Date(day.date);
                  const isToday = idx === 0;
                  const dayLabel = isToday
                    ? "Today"
                    : dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                  return (
                    <div
                      key={day.date}
                      className={`p-3 rounded-2xl border text-center transition-colors ${
                        isToday
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                          : "bg-stone-50 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                        {dayLabel}
                      </span>
                      <span className="text-[11px] text-stone-400 block mb-2">
                        {dateLabel}
                      </span>

                      <div className="my-1">
                        <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 block">High</span>
                        <span className="font-extrabold text-base text-stone-900 dark:text-white block">
                          {day.temp_max_c != null ? `${Math.round(day.temp_max_c)}°C` : "—"}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                          Low: {day.temp_min_c != null ? `${Math.round(day.temp_min_c)}°C` : "—"}
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px] text-sky-700 dark:text-sky-300 font-semibold flex items-center justify-center gap-1">
                        <Droplets size={12} />
                        <span>{day.rainfall_mm != null ? `${day.rainfall_mm} mm rain` : "Rain —"}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                        {day.humidity_percent != null ? `${Math.round(day.humidity_percent)}% humidity` : "Humidity —"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-3 text-right">
                Forecasts can change; check local advisories before field decisions.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Farm tools ── */}
        <section aria-labelledby="farm-tools-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 id="farm-tools-title" className="text-base font-semibold tracking-tight text-stone-900 dark:text-white">Farm tools</h3>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Useful services, together in one place.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <Link
              to="/features/market-intelligence"
              className="group flex min-h-32 flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  <LineChart size={16} />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 transition-colors group-hover:text-emerald-700 dark:text-white">
                  Mandi prices
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Compare nearby markets and recent crop prices.
                </p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Open tool <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>

            <Link
              to="/features/schemes"
              className="group flex min-h-32 flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  <Landmark size={16} />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 transition-colors group-hover:text-emerald-700 dark:text-white">
                  Government schemes
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Explore support programmes and eligibility details.
                </p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Open tool <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>

            <Link
              to="/marketplace"
              className="group flex min-h-32 flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <Store size={16} />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 transition-colors group-hover:text-emerald-700 dark:text-white">
                  Farmer marketplace
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Browse harvest listings or offer your own produce.
                </p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Open tool <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>

            <Link
              to="/features/irrigation"
              className="group flex min-h-32 flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"><Droplets size={16} /></div>
                <h4 className="text-sm font-semibold text-stone-900 transition-colors group-hover:text-emerald-700 dark:text-white">Irrigation advisor</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">Review field moisture and weather inputs for a watering check.</p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Open tool <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          </div>
        </section>

      </motion.div>
    </div>
  );
}
