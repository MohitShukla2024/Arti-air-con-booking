"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageSquare, Snowflake, Menu, X, User, CalendarPlus } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useAuthStore } from "@/store/use-auth-store";
import { useSettingsStore } from "@/store/use-settings-store";

import { useLanguageStore } from "@/store/use-language-store";
import { TRANSLATIONS } from "@/lib/translations";
import { Globe } from "lucide-react";
import { NotificationBellDropdown } from "@/components/notifications/notification-bell-dropdown";

export interface HeaderNavbarProps {
  variant?: "public" | "customer" | "admin";
}

export function HeaderNavbar({ variant = "public" }: HeaderNavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const { brandName, phone, emergencyPhone } = useSettingsStore();
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  // Auth-aware booking navigation
  const handleBookNav = () => {
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      router.push("/login?redirect=/book");
    } else {
      router.push("/book");
    }
  };

  const t = TRANSLATIONS[language];
  const phoneRaw = phone.replace(/[^0-9+]/g, "");

  const portalLabel = variant === "admin" ? "Admin Portal" : variant === "customer" ? "Customer Portal" : null;

  return (
    <>
      {/* Top Contact & Quick Action Bar */}
      <div className="bg-[#0050cb] text-white py-2 px-3 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center text-[11px] sm:text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href={`tel:${phoneRaw}`}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-h-[32px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </a>
            <a
              href={`https://wa.me/${phoneRaw.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xs:flex items-center gap-1.5 hover:opacity-80 transition-opacity min-h-[32px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Conversion Trust Micro-copy */}
          <div className="hidden lg:flex items-center gap-2 text-white/90 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.trustBanner}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden md:inline">Emergency Support: {emergencyPhone}</span>
            <span className="hidden md:inline w-1.5 h-1.5 bg-white rounded-full"></span>
            
            {/* Language Selector Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1 hover:bg-white/20 px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/30 transition-all"
              title="Switch Language"
            >
              <Globe className="w-3 h-3" />
              <span>{language === "en" ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-6 max-w-[1280px] mx-auto h-16 sm:h-20 bg-[#f7f9fb]/90 backdrop-blur-xl border-b border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.05)]">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0066ff] rounded-xl flex items-center justify-center text-white shadow-md">
            <Snowflake className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="font-display text-lg sm:text-2xl font-bold text-[#0050cb] tracking-tight">
            {brandName}
          </span>
          {portalLabel && (
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#0050cb]">
              {portalLabel}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/" className="text-sm font-semibold text-[#555f6c] hover:text-[#0050cb] transition-all">
            {t.navHome}
          </Link>
          <Link href="/#services" className="text-sm font-semibold text-[#555f6c] hover:text-[#0050cb] transition-all">
            {t.navServices}
          </Link>
          <Link href="/#pricing" className="text-sm font-semibold text-[#555f6c] hover:text-[#0050cb] transition-all">
            {t.navPricing}
          </Link>
          <button
            onClick={handleBookNav}
            className="text-sm font-semibold text-[#0050cb] hover:underline flex items-center gap-1"
          >
            <CalendarPlus className="w-4 h-4" /> {t.navBook}
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBellDropdown variant="light" />
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 bg-white border border-[#0050cb] text-[#0050cb] px-3 sm:px-4 py-2 rounded-full text-xs font-bold hover:bg-[#dae1ff]/20 transition-all min-h-[40px]"
              >
                <User className="w-4 h-4" /> <span>{t.navDashboard}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-[#ba1a1a] hover:underline hidden sm:inline px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 border-[#0050cb] text-[#0050cb] text-xs font-bold transition-all hover:bg-[#dae1ff]/20 min-h-[40px] flex items-center justify-center"
              >
                {t.navLogin}
              </Link>
              <button
                onClick={handleBookNav}
                className="hidden sm:flex px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#0066FF] to-[#3B82F6] text-white text-xs font-bold transition-all hover:scale-[1.02] shadow-md min-h-[40px] items-center justify-center"
              >
                {t.navBook}
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0050cb] rounded-lg hover:bg-[#dae1ff]/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[100px] sm:top-[116px] z-40 bg-white/95 backdrop-blur-xl border-b border-[#c2c6d8]/30 p-5 sm:p-6 flex flex-col gap-3.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#191c1e] hover:text-[#0050cb] py-2.5 border-b border-[#eceef0] flex items-center justify-between"
            >
              <span>{link.name}</span>
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-3.5 rounded-full border-2 border-[#0050cb] text-[#0050cb] font-bold text-sm min-h-[44px] flex items-center justify-center"
          >
            Customer Login / Signup
          </Link>
          <button
            onClick={handleBookNav}
            className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-[#0066FF] to-[#3B82F6] text-white font-bold text-sm shadow-md min-h-[44px] flex items-center justify-center"
          >
            Book Service Now
          </button>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-3 rounded-full bg-[#191c1e] text-white font-bold text-xs min-h-[44px] flex items-center justify-center"
          >
            Admin Portal Gateway
          </Link>
        </div>
      )}
    </>
  );
}
