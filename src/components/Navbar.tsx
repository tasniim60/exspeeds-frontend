"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  LogOut,
  Plus,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  User,
  UserPlus,
  Package,
  Home,
  Layers,
  Truck,
  Building2,
  BookOpen,
  Phone,
  Menu,
  X,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar({ variant }: { variant?: "public" | "auth" }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { t, isRTL, locale, getLocalizedPath } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = getLocalizedPath("/login");
  };

  // Resolve variant: explicit prop wins, otherwise infer from the route.
  const isAuth =
    variant === "auth" ||
    (!variant && (pathname.includes("/login") || pathname.includes("/register")));

  // Hide public navbar inside full-screen Admin Dashboard
  if (pathname.includes("/admin") || pathname.includes("/dashboard")) {
    return null;
  }

  const navLinks = [
    { name: t("nav.home"), href: "/", icon: <Home className="w-4 h-4 shrink-0" /> },
    { name: t("nav.services"), href: "/services", icon: <Layers className="w-4 h-4 shrink-0" /> },
    { name: t("nav.track"), href: "/track", icon: <Truck className="w-4 h-4 shrink-0" /> },
    { name: t("nav.about"), href: "/about", icon: <Building2 className="w-4 h-4 shrink-0" /> },
    { name: t("nav.blog"), href: "/blog", icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { name: t("nav.contact"), href: "/contact", icon: <Phone className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 text-gray-900 border-b border-gray-100/90 shadow-xs backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between">
        <Link href={getLocalizedPath("/")} className="flex items-center group py-0.5">
          <img
            src="/assets/xspeed_logo_earth_light.jpg"
            alt="XSPEED - Fast & Secure"
            width={200}
            height={58}
            className="h-12 sm:h-[58px] w-auto object-contain shrink-0 mix-blend-multiply group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Navigation Links (Scaled cleanly for 1024px+ without wrapping) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navLinks.map((link) => {
            const localizedHref = getLocalizedPath(link.href);
            const isActive =
              link.href === "/"
                ? pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/"
                : pathname.startsWith(`/${locale}${link.href}`) || pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={localizedHref}
                className={`relative px-2.5 xl:px-4 py-2 text-xs xl:text-sm font-bold transition-all rounded-full whitespace-nowrap ${
                  isActive
                    ? "text-[#C45B2A] font-extrabold"
                    : "text-gray-700 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 inset-x-2.5 xl:inset-x-4 h-[3px] bg-[#C45B2A] rounded-full shadow-xs" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions Group (>= 1024px) */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="nav-light" />

          {/* Show Auth Buttons or User Profile for public pages only */}
          {!isAuth && (
            <>
              {mounted && user ? (
                <div className="flex items-center gap-2.5">
                  {/* User Profile Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 py-1.5 px-3 rounded-full border border-gray-200 text-xs transition-all group cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#C45B2A] text-white flex items-center justify-center font-black text-[11px] shadow-xs shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="font-bold text-gray-800 leading-tight truncate max-w-[120px] xl:max-w-[140px]">
                        {user.name || t("nav.profile")}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div
                          className={`absolute ${
                            isRTL ? "left-0 text-right" : "right-0 text-left"
                          } mt-2.5 w-64 rounded-2xl bg-white border border-gray-200 shadow-2xl py-2 z-50 animate-fade-up text-gray-900 overflow-hidden`}
                        >
                          {/* User Identity Header */}
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-[#C45B2A] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-black text-gray-900 truncate">{user.name || "User"}</p>
                                <p className="text-[11px] text-gray-500 truncate">{user.email || ""}</p>
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${user.role === "admin" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${user.role === "admin" ? "text-amber-600" : "text-emerald-600"}`}>
                                {user.role === "admin" ? (isRTL ? "مدير النظام / Admin" : "Logistics Admin") : (isRTL ? "حساب عميل / Shipper" : "Shipper Account")}
                              </span>
                            </div>
                          </div>

                          {/* Menu Links */}
                          <div className="py-1.5 px-1 space-y-0.5">
                            <Link
                              href={getLocalizedPath("/profile")}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <User className="w-4 h-4 text-[#C45B2A]" />
                                <span>{t("nav.profile")}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 ${isRTL ? "rotate-180" : ""}`} />
                            </Link>

                            <Link
                              href={getLocalizedPath("/ship")}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:text-[#C45B2A] hover:bg-orange-50 rounded-xl transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <Plus className="w-4 h-4 text-[#C45B2A]" />
                                <span>{t("nav.requestShipment")}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 ${isRTL ? "rotate-180" : ""}`} />
                            </Link>

                            {user.role === "admin" && (
                              <Link
                                href={getLocalizedPath("/admin")}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                                  <span>{t("nav.adminDashboard")}</span>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 text-amber-500 ${isRTL ? "rotate-180" : ""}`} />
                              </Link>
                            )}
                          </div>

                          {/* Sign Out */}
                          <div className="border-t border-gray-100 pt-1.5 px-1">
                            <button
                              type="button"
                              onClick={() => {
                                setUserMenuOpen(false);
                                handleLogout();
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <LogOut className="w-4 h-4 text-red-600" />
                                <span>{t("nav.signOut")}</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex items-center gap-2 xl:gap-3 ${isRTL ? "border-r pr-2 xl:pr-3" : "border-l pl-2 xl:pl-3"} border-gray-200`}>
                  <Link
                    href={getLocalizedPath("/login")}
                    className="text-xs font-bold text-gray-700 hover:text-[#C45B2A] transition-colors px-2.5 xl:px-3 py-2 hover:bg-gray-50 rounded-full whitespace-nowrap"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href={getLocalizedPath("/register")}
                    className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white text-xs xl:text-sm font-bold py-2 xl:py-2.5 px-4 xl:px-6 rounded-full flex items-center gap-1.5 shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t("nav.register")}</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Medium Screen Toolbar (768px - 1023px Tablets & iPad) */}
        <div className="hidden md:flex lg:hidden items-center gap-2 sm:gap-3">
          {/* Direct Language Switcher */}
          <LanguageSwitcher variant="nav-light" />

          {/* Quick Request Shipment or User Profile */}
          {!isAuth && (
            <>
              {mounted && user ? (
                <Link
                  href={getLocalizedPath("/profile")}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 py-1.5 px-3 rounded-full border border-gray-200 text-xs font-bold text-gray-800 transition-all shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#C45B2A] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name || t("nav.profile")}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={getLocalizedPath("/login")}
                    className="text-xs font-bold text-gray-700 hover:text-[#C45B2A] px-2.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href={getLocalizedPath("/ship")}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white text-xs font-bold py-2 px-3.5 rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("nav.requestShipment")}</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile & Tablet Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 sm:px-3 sm:py-2 rounded-xl text-gray-700 hover:text-[#C45B2A] hover:bg-orange-50/70 border border-gray-200/80 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-[#C45B2A]" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
          <span className="hidden sm:inline text-xs font-bold text-gray-800">
            {mobileOpen ? (isRTL ? "إغلاق" : "Close") : (isRTL ? "القائمة" : "Menu")}
          </span>
        </button>
      </div>

      {/* Mobile & Tablet Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 px-4 sm:px-6 md:px-8 py-6 animate-fade-up shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Phone-only Language Switcher Header (Tablet has it directly in the topbar) */}
            <div className="flex md:hidden items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isRTL ? "تصفح الموقع" : "Navigation"}
              </span>
              <LanguageSwitcher variant="nav-light" />
            </div>

            {/* Navigation Links Grid: 1 col on phone, 2 cols on tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const localizedHref = getLocalizedPath(link.href);
                const isActive =
                  link.href === "/"
                    ? pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/"
                    : pathname.startsWith(`/${locale}${link.href}`) || pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={localizedHref}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? "text-[#C45B2A] bg-orange-50/90 border border-orange-200/80 font-extrabold shadow-2xs"
                        : "text-gray-700 hover:text-gray-950 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span className={isActive ? "text-[#C45B2A]" : "text-gray-400"}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                    <ChevronRight className={`w-4 h-4 mr-auto text-gray-300 ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions & Auth Group */}
            <div className="pt-4 border-t border-gray-100">
              {mounted && user ? (
                <div className="space-y-3">
                  <Link
                    href={getLocalizedPath("/profile")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs transition-colors border border-gray-200 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#C45B2A] text-white flex items-center justify-center font-black text-sm shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="text-start">
                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[220px]">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[#C45B2A] font-bold text-xs flex items-center gap-1">
                      <span>{t("nav.profile")}</span>
                      <ChevronRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                    </span>
                  </Link>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link
                      href={getLocalizedPath("/ship")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C45B2A] text-white font-bold text-xs shadow-sm hover:bg-[#A34920] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("nav.requestShipment")}</span>
                    </Link>

                    {user.role === "admin" ? (
                      <Link
                        href={getLocalizedPath("/admin")}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>{t("nav.adminDashboard")}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        {t("nav.signOut")}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                      href={getLocalizedPath("/login")}
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-3 rounded-2xl border border-gray-300 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      {t("nav.signIn")}
                    </Link>
                    <Link
                      href={getLocalizedPath("/register")}
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-3 rounded-2xl bg-gradient-to-r from-[#C45B2A] to-[#E65100] text-white text-sm font-bold hover:from-[#A34920] hover:to-[#C45B2A] shadow-md shadow-orange-500/20 transition-all"
                    >
                      {t("auth.signUpBtn")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

