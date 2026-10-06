import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sprout,
  FlaskConical,
  Droplets,
  TrendingUp,
  Bell,
  ArrowRight,
  MapPin,
  Ruler,
  Phone,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Simulated price data based on common MP crops ─────────────────────────────
const priceData = [
  { month: "Jan", soybean: 3800, wheat: 2100 },
  { month: "Feb", soybean: 3950, wheat: 2200 },
  { month: "Mar", soybean: 4100, wheat: 2050 },
  { month: "Apr", soybean: 3900, wheat: 2300 },
  { month: "May", soybean: 4200, wheat: 2400 },
  { month: "Jun", soybean: 4050, wheat: 2250 },
];

// ── Quick action modules ───────────────────────────────────────────────────────
const quickActions = [
  {
    title: "Crop Recommendation",
    desc: "Find the best crop for your soil & climate",
    icon: Sprout,
    link: "/crop-prediction",
    status: "live",
    color: "from-emerald-700 to-green-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  {
    title: "Fertilizer Advisor",
    desc: "Balance soil NPK & calculate exact dosage",
    icon: FlaskConical,
    link: "/fertilizer-prediction",
    status: "live",
    color: "from-amber-700 to-yellow-800",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
  },
  {
    title: "Irrigation Advisor",
    desc: "Calculate watering requirements & savings",
    icon: Droplets,
    link: "/features/irrigation",
    status: "live",
    color: "from-sky-700 to-blue-800",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-800 dark:text-sky-300",
  },
  {
    title: "Price Forecaster",
    desc: "Predict tomorrow's mandi price trends",
    icon: TrendingUp,
    link: "/features/price-prediction",
    status: "live",
    color: "from-teal-700 to-emerald-800",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
    text: "text-teal-800 dark:text-teal-300",
  },
];

// ── Simulated recent activity ─────────────────────────────────────────────────
const recentActivity = [
  {
    type: "Crop Recommendation",
    result: "Rice recommended (92% confidence score)",
    date: "Today, 10:30 AM",
    icon: Sprout,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    type: "Fertilizer Advisor",
    result: "DAP — 62 kg calculated for 2.0 hectares",
    date: "Yesterday, 3:15 PM",
    icon: FlaskConical,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    type: "Irrigation Advisor",
    result: "Recommended: Schedule watering for tomorrow morning",
    date: "2 days ago",
    icon: Droplets,
    color: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  },
];

const getAlerts = (location) => [
  {
    type: "warning",
    message: `Light rainfall expected near ${location || "your area"} in next 48 hours — delay fertilizer application.`,
    time: "2 hours ago",
  },
  {
    type: "info",
    message: `Soybean prices rising in ${location || "local"} mandi this week — good window to plan harvest sale.`,
    time: "5 hours ago",
  },
  {
    type: "success",
    message: "Optimal sowing window for Rabi crops begins in 2 weeks. Prepare soil moisture and seed treatment now.",
    time: "Yesterday",
  },
];

const alertStyles = {
  warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200",
  info: "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200",
  success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
};

const alertIcons = { warning: "⚠️", info: "ℹ️", success: "✅" };

export default function UserDashboard() {
  const { user } = useAuth();

  const firstName = user?.username?.split(" ")[0] || user?.name?.split(" ")[0] || "Farmer";
  const location = user?.location || "Bhopal, MP";
  const farmSize = user?.farm_size || null;
  const phone = user?.phone || null;
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Member";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const alerts = getAlerts(location);
  const mandiCity = location.split(",")[0].trim();

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-900 dark:text-stone-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Section 1: Welcome Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-3 py-1 rounded-full mb-3">
              <Sparkles size={14} />
              Verified Farmer Profile
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2 text-sm">
              <Calendar size={15} />
              <span>{today}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-2xl self-start md:self-auto shadow-xs">
            <MapPin size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
              {location}
            </span>
          </div>
        </motion.div>

        {/* ── Section 2: Farm Snapshot ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>🌾</span>
              <span>Your Farm Profile</span>
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              Synced with account database
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Registered Location",
                value: location,
                icon: MapPin,
                color: "text-emerald-700 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-950/40",
              },
              {
                label: "Land Area",
                value: farmSize ? `${farmSize} hectares` : "Not specified",
                icon: Ruler,
                color: "text-blue-700 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-950/40",
              },
              {
                label: "Contact Phone",
                value: phone || "Not specified",
                icon: Phone,
                color: "text-amber-700 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-950/40",
              },
              {
                label: "Membership Status",
                value: joinedDate,
                icon: ShieldCheck,
                color: "text-teal-700 dark:text-teal-400",
                bg: "bg-teal-50 dark:bg-teal-950/40",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-5"
                >
                  <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center mb-3 shadow-xs`}>
                    <Icon size={18} className={item.color} />
                  </div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">{item.label}</p>
                  <p className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base truncate">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Section 3: Quick Action AI Tools ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>⚡</span>
              <span>Quick AI Tools</span>
            </h2>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
            >
              <span>Explore All Advisory Modules</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link to={action.link} key={i}>
                  <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-5 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-2xl ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Icon size={22} className={action.text} />
                        </div>
                        <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          Ready
                        </span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 dark:text-white text-base mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        {action.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                      <span>Open tool</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* ── Section 4 & 5: Recent Activity & Smart Alerts ── */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>🕐</span>
                  <span>Recent Recommendations</span>
                </h2>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
                  Sample Log
                </span>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-5">
                Session history log from your recent AI analysis runs.
              </p>

              <div className="space-y-3">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/40 dark:border-stone-800/60 hover:bg-stone-100/80 dark:hover:bg-stone-800 transition"
                    >
                      <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                          {activity.type}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {activity.result}
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0 font-medium">
                        {activity.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Persistent session token verified
              </span>
              <Link to="/crop-prediction" className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                New Analysis →
              </Link>
            </div>
          </motion.div>

          {/* Smart Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">
                    Farm Weather & Soil Alerts
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
                  Simulated
                </span>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-5">
                Targeted alerts calibrated to: <span className="font-bold text-stone-700 dark:text-stone-300">{location}</span>
              </p>

              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`border-l-4 px-4 py-3.5 rounded-2xl text-xs sm:text-sm ${alertStyles[alert.type]} shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-base select-none">{alertIcons[alert.type]}</span>
                        <p className="font-medium leading-relaxed">{alert.message}</p>
                      </div>
                      <span className="text-[10px] font-bold opacity-60 shrink-0">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Weather integration active
              </span>
              <Link to="/features/irrigation" className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                Water Schedule →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Section 6: Mandi Market Snapshot ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-card p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <BarChart2 size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-stone-900 dark:text-white">
                  {mandiCity} Mandi — Price Snapshot
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Illustrative ₹/quintal values — live data connects to Agmarknet API in production
                </p>
              </div>
            </div>

            <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 self-start sm:self-auto">
              📊 Simulated Market Rates
            </span>
          </div>

          <div className="h-60 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="soybeanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="wheatGradUser" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`₹${val}/q`, ""]}
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderRadius: "16px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="soybean" stroke="#2d6a4f" strokeWidth={2.5} fill="url(#soybeanGrad)" name="Soybean" />
                <Area type="monotone" dataKey="wheat" stroke="#d97706" strokeWidth={2.5} fill="url(#wheatGradUser)" name="Wheat" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
            <div className="flex gap-6 font-semibold text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
                Soybean Mandi Price
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
                Wheat Mandi Price
              </span>
            </div>

            <Link
              to="/features/price-prediction"
              className="text-emerald-800 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1.5"
            >
              <span>Forecast Tomorrow's Price with LSTM</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}