import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sprout, Menu, X, LayoutDashboard, LogOut, User, Store, Landmark, LineChart, Languages, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
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

  const navLinks = [
    { to: "/dashboard", label: t("nav.dashboard", { defaultValue: "Dashboard" }), icon: LayoutDashboard },
    { to: "/features/market-intelligence", label: t("nav.market", { defaultValue: "Mandi prices" }), fullLabel: t("nav.market_full", { defaultValue: "Mandi prices" }), icon: LineChart },
    { to: "/features/schemes", label: t("nav.schemes", { defaultValue: "Schemes" }), fullLabel: t("nav.schemes_full", { defaultValue: "Government schemes" }), icon: Landmark },
    { to: "/marketplace", label: t("nav.marketplace", { defaultValue: "Marketplace" }), icon: Store },
    ...(isLoggedIn && user?.role === "admin" ? [{ to: "/admin/listings", label: "Admin listings", icon: ShieldCheck }] : []),
  ];

  const languagePicker = (compact = false) => (
    <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 bg-[#faf9f5] px-2.5 ${compact ? "min-h-11 w-full" : "h-9"} text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:border-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100`}>
      <Languages size={15} aria-hidden="true" />
      <span className="sr-only">Choose language</span>
      <select
        aria-label={t("nav.chooseLanguage", { defaultValue: "Choose language" })}
        value={i18n.resolvedLanguage?.split("-")[0] || "en"}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        className={`min-w-0 cursor-pointer rounded-md bg-transparent py-1 text-stone-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-stone-100 [color-scheme:light] dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-stone-900 dark:[&>option]:bg-stone-900 dark:[&>option]:text-stone-100 ${compact ? "flex-1" : "max-w-24"}`}
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ta">தமிழ்</option>
        <option value="ur">اردو</option>
      </select>
    </label>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 dark:bg-[#0b1410]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded-xl py-1"
            aria-label="Krishi AI Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-900 transition-colors">
              <Sprout size={22} className="text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-emerald-950 dark:text-emerald-50">
                Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 -mt-1 hidden xs:block">
                Smart Agriculture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isLanding && <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-label={link.fullLabel || link.label}
                  title={link.fullLabel || link.label}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/60"
                      : "text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100/70 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-emerald-700 dark:text-emerald-400" : "text-stone-400"} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLanding && <div className="sm:hidden">{languagePicker()}</div>}
            <div className="hidden sm:block">{languagePicker()}</div>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold ${isLanding ? "text-emerald-800 dark:text-emerald-300" : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"}`}
                >
                  <User size={15} />
                  <span className="max-w-[120px] truncate">{isLanding ? "Dashboard" : user?.username || user?.name || "Farmer"}</span>
                </Link>

                {!isLanding && <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">{t("nav.logout", { defaultValue: "Log out" })}</span>
                </button>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                >
                  {t("nav.login", { defaultValue: "Log in" })}
                </Link>

                {!isLanding && <Link
                  to="/onboarding"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all"
                >
                  {t("nav.get_started", { defaultValue: "Get started" })}
                </Link>}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isLanding && <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {!isLanding && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer Panel */}
      {!isLanding && <div
        className={`fixed top-0 right-0 bottom-0 w-[80%] max-w-xs z-50 bg-[#FAF9F5] dark:bg-[#0d1a14] border-l border-stone-200 dark:border-stone-800 shadow-xl flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-700" />
            <span className="font-bold text-base text-emerald-950 dark:text-white">Krishi AI</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-800 text-white"
                    : "text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
          <div className="mb-3 sm:hidden">{languagePicker(true)}</div>
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                  {(user?.username || user?.name || "F")[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {user?.username || user?.name || "Farmer"}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{user?.email || "Logged in"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 bg-white dark:bg-stone-800"
              >
                <LogOut size={16} />
                <span>{t("nav.logout", { defaultValue: "Log out" })}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-white bg-white dark:bg-stone-800"
              >
                {t("nav.login", { defaultValue: "Log in" })}
              </Link>
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-emerald-800 text-white shadow-sm"
              >
                {t("nav.get_started", { defaultValue: "Get started" })}
              </Link>
            </div>
          )}
        </div>
      </div>}
    </header>
  );
}
