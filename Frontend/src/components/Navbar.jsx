import { useState, useRef, useEffect } from "react";
import {
  Sprout,
  User,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Globe,
  Menu,
  X,
  Droplets,
  TrendingUp,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const langRef = useRef(null);
  const menuRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/crop-prediction", label: t("nav.crop_prediction") },
    { to: "/fertilizer-prediction", label: t("modules.fertilizer_advisor", { defaultValue: "Fertilizer" }) },
    { to: "/features/irrigation", label: t("nav.irrigation_advisor") },
    { to: "/features/price-prediction", label: t("modules.price_forecaster", { defaultValue: "Mandi Prices" }) },
  ];

  const currentLangLabel = {
    hi: "हिन्दी",
    ta: "தமிழ்",
    ur: "اردو",
    en: "English",
  }[i18n.language] || "EN";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F5]/90 dark:bg-[#0d1b16]/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-800/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-emerald-600 dark:to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform duration-300">
              <Sprout size={24} className="text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-emerald-950 dark:text-emerald-50 flex items-center gap-1.5">
                Krishi<span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700/80 dark:text-emerald-400/80 -mt-1 hidden sm:block">
                Smart Agriculture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30"
                      : "text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/60 dark:hover:bg-stone-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme switcher */}
            <ThemeSwitcher />

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Select Language"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 hover:bg-white dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                <Globe size={16} className="text-emerald-700 dark:text-emerald-400" />
                <span>{currentLangLabel}</span>
                <ChevronDown
                  size={14}
                  className={`text-stone-500 transition-transform duration-200 ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { code: "en", label: "English", sub: "Global" },
                    { code: "hi", label: "हिन्दी", sub: "Hindi" },
                    { code: "ta", label: "தமிழ்", sub: "Tamil" },
                    { code: "ur", label: "اردو", sub: "Urdu" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                        i18n.language === lang.code
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      <span className="font-medium">{lang.label}</span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">{lang.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Dropdown or CTA */}
            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(user?.username || user?.name || "F")[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 hidden sm:inline max-w-[100px] truncate">
                    {user?.username || user?.name || "Farmer"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-emerald-700 dark:text-emerald-400 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                      <p className="font-bold text-sm text-stone-900 dark:text-white truncate">
                        {user?.username || user?.name || "Farmer"}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {user?.email || "Signed In"}
                      </p>
                    </div>

                    <div className="pt-1.5 space-y-1">
                      <Link
                        to="/user-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 transition"
                      >
                        <LayoutDashboard size={16} className="text-emerald-600" />
                        {t("nav.my_dashboard")}
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                      >
                        <LogOut size={16} />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                >
                  {t("nav.login")}
                </Link>

                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all"
                >
                  {t("nav.get_started")}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 dark:border-stone-800 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1 px-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition ${
                      isActive
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200"
                        : "text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {!isLoggedIn && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-white"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold bg-emerald-700 text-white"
                  >
                    {t("nav.get_started")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}