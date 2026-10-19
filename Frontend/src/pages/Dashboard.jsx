import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CloudRain,
  Thermometer,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Ruler,
  Droplets,
  LineChart,
  Landmark,
  Store,
  ArrowRight,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getFarmWeather } from "../services/weatherLocation";

const PROFILE_KEY = "krishi_farm_profile_v2";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [weatherState, setWeatherState] = useState({
    loading: true,
    data: null,
    error: null,
  });

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
  const accountLocation = (user?.location || "").split(",").map((part) => part.trim());
  const farmLocation = profile?.farmLocation?.district
    ? profile.farmLocation
    : { district: accountLocation[0], state: accountLocation[1] };
  const districtName = farmLocation.district || "your farm";
  const weatherLocationKey = `${farmLocation.district || ""}|${farmLocation.state || ""}`;

  useEffect(() => {
    let isMounted = true;
    setWeatherState({ loading: true, data: null, error: null });

    getFarmWeather(farmLocation)
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
  }, [weatherLocationKey]);

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
    ? profile?.activeFarming?.cropName || "Current Crop"
    : isPlanning
    ? profile?.planningFarming?.primaryCrop || profile?.planningFarming?.interestedCrops?.[0] || profile?.planningFarming?.cropRecommendation?.recommended_crop || "Planned Crop"
    : null;

  const rawSowingDate = profile?.activeFarming?.sowingDate;
  const plannedPeriod = profile?.planningFarming?.plannedSowingPeriod;
  const plannedSeason = profile?.planningFarming?.farmingSeason;

  // Generate dated crop calendar tasks
  const calendarTasks = (() => {
    if (!profile) return [];

    if (isCultivating && rawSowingDate) {
      const baseDate = new Date(rawSowingDate);
      const isValid = !isNaN(baseDate.getTime());

      const addDays = (days) => {
        if (!isValid) return `Day ${days}`;
        const d = new Date(baseDate);
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      };

      const now = new Date();
      const daysSinceSowing = isValid ? Math.floor((now - baseDate) / (1000 * 60 * 60 * 24)) : 0;

      return [
        {
          dayOffset: 0,
          dateStr: isValid ? baseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Day 0",
          title: "Sowing & Seed Treatment",
          desc: "Complete primary seed treatment with bio-fungicide and sow seeds at recommended depth.",
          status: daysSinceSowing >= 0 ? "done" : "upcoming",
        },
        {
          dayOffset: 15,
          dateStr: addDays(15),
          title: "Seedling Emergence & Stand Check",
          desc: "Inspect germination uniformity across rows. Provide a light irrigation if the topsoil has dried.",
          status: daysSinceSowing >= 15 ? "done" : daysSinceSowing >= 0 ? "next" : "upcoming",
        },
        {
          dayOffset: 30,
          dateStr: addDays(30),
          title: "Weeding & First Nutrient Dose",
          desc: "Perform first intercultural weeding. Apply the planned first split of nitrogen / compost as required.",
          status: daysSinceSowing >= 30 ? "done" : daysSinceSowing >= 15 ? "next" : "upcoming",
        },
        {
          dayOffset: 45,
          dateStr: addDays(45),
          title: "Crown Root / Tillering Stage",
          desc: "Assess tillering progress and maintain adequate root-zone soil moisture.",
          status: daysSinceSowing >= 45 ? "done" : daysSinceSowing >= 30 ? "next" : "upcoming",
        },
        {
          dayOffset: 60,
          dateStr: addDays(60),
          title: "Vegetative Growth & Pest Scouting",
          desc: "Scout underside of leaves for early insect activity or fungal spots before flowering.",
          status: daysSinceSowing >= 60 ? "done" : daysSinceSowing >= 45 ? "next" : "upcoming",
        },
        {
          dayOffset: 90,
          dateStr: addDays(90),
          title: "Flowering & Grain Development",
          desc: "Critical water demand stage. Ensure field does not face dry stress during grain formation.",
          status: daysSinceSowing >= 90 ? "done" : daysSinceSowing >= 60 ? "next" : "upcoming",
        },
        {
          dayOffset: 120,
          dateStr: addDays(120),
          title: "Physiological Maturity & Harvest",
          desc: "Inspect grain hardness and moisture content (12-14%). Check nearby mandi prices before cutting.",
          status: daysSinceSowing >= 120 ? "done" : daysSinceSowing >= 90 ? "next" : "upcoming",
        },
      ];
    }

    // Planning branch
    return [
      {
        dateStr: "3 Weeks Before Sowing",
        title: "Field Preparation & Deep Plowing",
        desc: "Plow field and incorporate well-rotted farmyard manure (FYM) to improve moisture retention.",
        status: "next",
      },
      {
        dateStr: "2 Weeks Before Sowing",
        title: "Seed Sourcing & Germination Test",
        desc: "Procure certified high-yield seed varieties from registered cooperatives; test germination rate.",
        status: "upcoming",
      },
      {
        dateStr: "1 Week Before Sowing",
        title: "Pre-sowing Irrigation (Paleva)",
        desc: "Give a light irrigation to establish adequate soil moisture for uniform seed emergence.",
        status: "upcoming",
      },
      {
        dateStr: plannedPeriod || "Sowing Window",
        title: `Sowing Window (${plannedSeason || "Planned Season"})`,
        desc: `Sow ${cropName || "your planned crop"} at optimal spacing and apply basal fertilizer dose.`,
        status: "upcoming",
      },
      {
        dateStr: "15 Days After Sowing",
        title: "Initial Emergence & Weed Inspection",
        desc: "Verify germination uniformity and remove competing early weeds.",
        status: "upcoming",
      },
    ];
  })();

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
    const nextTask = calendarTasks.find((t) => t.status === "next") || calendarTasks[1] || calendarTasks[0];
    return {
      title: nextTask ? nextTask.title : "Maintain regular field inspection",
      text: nextTask ? `${nextTask.desc} (Target: ${nextTask.dateStr})` : "Check soil moisture and field borders.",
      link: null,
      btnLabel: null,
    };
  })();

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen bg-[#FAF9F5] dark:bg-[#0b1410] text-stone-900 dark:text-stone-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">

        {/* ── Welcome Greeting & Location ── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full inline-block mb-2">
                Farmer Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                Welcome back, {farmerName}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                <MapPin size={14} className="text-emerald-700 shrink-0" />
                <span>{locationText}</span>
              </p>
            </div>

            {profile ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {profile.farmLocation?.farmSize || "2"} {profile.farmLocation?.measurementUnit || "Acres"}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 capitalize">
                  {profile.farmLocation?.soilType || "Alluvial"} Soil
                </span>
                <Link
                  to="/onboarding"
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
        <div className="bg-emerald-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={20} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Recommended Next Action
              </p>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {nextAction.title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
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
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-700" />
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                  Current Crop Plan
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
                  {isCultivating ? "Sowing Date" : "Planned Period"}
                </span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5">
                  {isCultivating ? rawSowingDate || "Recorded" : plannedPeriod || "Upcoming"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Irrigation Source</span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5 capitalize">
                  {profile.farmLocation?.irrigationSource || "Borewell / Rainfed"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Water Status</span>
                <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white block mt-0.5 capitalize">
                  {profile.farmLocation?.waterAvailability || "Moderate"}
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

        {/* ── Crop Calendar & Milestone Tasks ── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                Crop Season Calendar
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Stage-by-stage field tasks
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {calendarTasks.map((task, i) => (
              <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                <div className="mt-1">
                  {task.status === "done" ? (
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                  ) : task.status === "next" ? (
                    <Clock size={18} className="text-amber-600 shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-stone-300 dark:border-stone-600 shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                      {task.title}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                      {task.dateStr}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                    {task.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Seven-Day Weather Section (Open-Meteo Integration) ── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-700" />
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                7-Day Local Weather Forecast
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {weatherState.data?.locationName || districtName}
            </span>
          </div>

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
                Live daily forecast provided via Open-Meteo.
              </p>
            </div>
          )}
        </div>

        {/* ── Working Features Jump Cards ── */}
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white mb-4">
            Preserved Working Tools
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/features/market-intelligence"
              className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-600 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-3">
                  <LineChart size={20} />
                </div>
                <h4 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                  Live Mandi Prices
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Daily AGMARKNET prices, arrivals, and price forecasts for nearby mandis.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>View prices</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/features/schemes"
              className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-600 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-3">
                  <Landmark size={20} />
                </div>
                <h4 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                  Government Schemes
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Direct eligibility matcher for PM-KISAN, PMFBY crop insurance, and KCC credit.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Check eligibility</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/marketplace"
              className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-600 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-3">
                  <Store size={20} />
                </div>
                <h4 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                  Farmer Marketplace
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Browse crop listings from fellow farmers or list your own harvest with quality grading.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Open marketplace</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
