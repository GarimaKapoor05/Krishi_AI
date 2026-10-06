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
  ArrowRight,
  ExternalLink,
  ShieldCheck,
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
  const userMenuRef = useRef(null);

  // Close open menus whenever the path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Click outside listener for desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
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
    { to: "/", label: t("nav.home", { defaultValue: "Home" }) },
    { to: "/dashboard", label: t("nav.dashboard", { defaultValue: "Dashboard" }) },
    { to: "/crop-prediction", label: t("nav.crop_prediction", { defaultValue: "Crop Advisor" }) },
    { to: "/fertilizer-prediction", label: t("modules.fertilizer_advisor", { defaultValue: "Fertilizer" }) },
    { to: "/features/irrigation", label: t("nav.irrigation_advisor", { defaultValue: "Irrigation" }) },
    { to: "/features/price-prediction", label: t("modules.price_forecaster", { defaultValue: "Mandi Prices" }) },
  ];

  const languages = [
    { code: "en", label: "English", native: "English", sub: "Global" },
    { code: "hi", label: "हिन्दी", native: "Hindi", sub: "Regional" },
    { code: "ta", label: "தமிழ்", native: "Tamil", sub: "Regional" },
    { code: "ur", label: "اردو", native: "Urdu", sub: "Regional" },
  ];

  const currentLangLabel =
    languages.find((l) => l.code === i18n.language)?.label || "English";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F5]/90 dark:bg-[#0b1410]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-emerald-950/40 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Left: Brand Identity */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl py-1 pr-2"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-emerald-600 dark:to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform duration-300">
                <Sprout size={22} className="text-emerald-200 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-emerald-950 dark:text-emerald-50 flex items-center gap-1">
                  Krishi<span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-emerald-700/80 dark:text-emerald-400/80 -mt-1 hidden xs:block">
                  Smart Agriculture
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 shadow-xs"
                        : "text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/70 dark:hover:bg-stone-800/40"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Theme Toggle */}
              <ThemeSwitcher />

              {/* Language Switcher Dropdown (Desktop & Tablet) */}
              <div className="relative hidden sm:block" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Select Language"
                  aria-expanded={langOpen}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold shadow-xs transition-all"
                >
                  <Globe size={15} className="text-emerald-700 dark:text-emerald-400" />
                  <span>{currentLangLabel}</span>
                  <ChevronDown
                    size={14}
                    className={`text-stone-400 dark:text-stone-500 transition-transform duration-200 ${
                      langOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500">
                      Select Language
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                          i18n.language === lang.code
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
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

              {/* Authentication Status / Profile / Call to Action */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="User Account Menu"
                    aria-expanded={userDropdownOpen}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {(user?.username || user?.name || "F")[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 hidden md:inline max-w-[100px] truncate">
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
                          {t("nav.my_dashboard", { defaultValue: "My Dashboard" })}
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                        >
                          <LogOut size={16} />
                          {t("nav.logout", { defaultValue: "Logout" })}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                  >
                    {t("nav.login", { defaultValue: "Login" })}
                  </Link>

                  <Link
                    to="/register"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:shadow-lg transition-all"
                  >
                    {t("nav.get_started", { defaultValue: "Get Started" })}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-50 bg-[#FAF9F5] dark:bg-[#0d1a14] border-l border-stone-200 dark:border-emerald-950/60 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Sprout size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-emerald-950 dark:text-emerald-50">
              Krishi<span className="text-emerald-600">AI</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* Quick Language Switcher Pills */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 mb-2.5 flex items-center gap-1.5 px-1">
              <Globe size={13} className="text-emerald-600" />
              <span>Language / भाषा / மொழி</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                    i18n.language === lang.code
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-600"
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className={`text-[10px] ${i18n.language === lang.code ? "text-emerald-200" : "text-stone-400"}`}>
                    {lang.native}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 mb-2 px-1">
              Advisory Navigation
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    ) : (
                      <ArrowRight size={14} className="text-stone-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Core Tools Quick Jump */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Free Public Access</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              KrishiAI models are open for all Indian farmers with no subscription fees or data harvesting.
            </p>
          </div>
        </div>

        {/* Drawer Footer / Auth Section */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60">
          {isLoggedIn ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {(user?.username || user?.name || "F")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                    {user?.username || user?.name || "Farmer"}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">
                    {user?.email || "Account Active"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/user-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-800 text-white"
                >
                  My Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-white dark:bg-stone-900"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-white bg-white dark:bg-stone-900 shadow-xs"
              >
                {t("nav.login", { defaultValue: "Login" })}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-emerald-800 text-white shadow-md shadow-emerald-900/20"
              >
                {t("nav.get_started", { defaultValue: "Get Started Free" })}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}