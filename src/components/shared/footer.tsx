"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useSettingsStore } from "@/store/use-settings-store";
import { useLanguageStore } from "@/store/use-language-store";
import { useAuthStore } from "@/store/use-auth-store";
import { TRANSLATIONS } from "@/lib/translations";
import { BRAND_INFO } from "@/lib/constants";
import { LEGAL_PAGES } from "@/lib/legal-metadata";

export function Footer() {
  const { brandName, phone, supportEmail, address, workingHours } = useSettingsStore();
  const { language } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleBookNav = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/book");
    } else {
      router.push("/book");
    }
  };

  const t = TRANSLATIONS[language];
  const phoneRaw = phone.replace(/[^0-9+]/g, "");
  const whatsappRaw = BRAND_INFO.whatsapp.replace(/[^0-9+]/g, "").replace("+", "");

  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-[#e0e3e5] dark:bg-[#eceef0] w-full py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center gap-8 border-t border-[#c2c6d8]/30"
      aria-label="Site footer"
    >
      <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-left">
        {/* Brand Info */}
        <div className="space-y-5">
          <Link href="/" className="flex items-center gap-2.5 w-fit" aria-label={`${brandName} home`}>
            <Image
              src="/icons/icon.svg"
              alt=""
              width={40}
              height={40}
              className="rounded-xl"
              aria-hidden="true"
            />
            <span className="font-display text-xl font-bold text-[#0050cb]">{brandName}</span>
          </Link>
          <p className="text-[#424656] text-sm leading-relaxed">{t.footerBrandDesc}</p>
          <div className="flex gap-3" aria-label="Social media links">
            <a
              href="#"
              aria-label="Facebook (coming soon)"
              className="w-10 h-10 rounded-full bg-[#dae1ff]/40 flex items-center justify-center text-[#0050cb] hover:bg-[#0050cb] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram (coming soon)"
              className="w-10 h-10 rounded-full bg-[#dae1ff]/40 flex items-center justify-center text-[#0050cb] hover:bg-[#0050cb] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="YouTube (coming soon)"
              className="w-10 h-10 rounded-full bg-[#dae1ff]/40 flex items-center justify-center text-[#0050cb] hover:bg-[#0050cb] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links">
          <h2 className="font-display text-base font-bold text-[#191c1e] mb-6">
            {t.footerQuickLinksHeader}
          </h2>
          <ul className="space-y-3 text-sm text-[#424656]">
            <li>
              <Link href="/" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                {t.navHome}
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                {t.navServices}
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                {t.navPricing}
              </Link>
            </li>
            <li>
              <button
                onClick={handleBookNav}
                className="hover:text-[#0050cb] font-semibold transition-colors focus:outline-none focus-visible:underline"
              >
                {t.navBook}
              </button>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#0050cb] font-semibold transition-colors focus:outline-none focus-visible:underline">
                {t.navLogin}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Services & Legal */}
        <nav aria-label="Services and legal">
          <h2 className="font-display text-base font-bold text-[#191c1e] mb-6">
            {t.footerServicesHeader}
          </h2>
          <ul className="space-y-3 text-sm text-[#424656] mb-6">
            <li>
              <Link href="/#services" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                AC Repair &amp; Service
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                AC Installation
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline">
                Gas Refill &amp; AMC Plans
              </Link>
            </li>
          </ul>
          <h3 className="font-display text-sm font-bold text-[#191c1e] mb-3">{t.footerLegalHeader}</h3>
          <ul className="space-y-2.5 text-sm text-[#424656]">
            {LEGAL_PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="hover:text-[#0050cb] transition-colors focus:outline-none focus-visible:underline"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Info */}
        <div>
          <h2 className="font-display text-base font-bold text-[#191c1e] mb-6">
            {t.footerContactHeader}
          </h2>
          <ul className="space-y-3.5 text-sm text-[#424656]">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#0050cb] shrink-0 mt-0.5" aria-hidden="true" />
              <address className="not-italic">{address}</address>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#0050cb] shrink-0" aria-hidden="true" />
              <a href={`tel:${phoneRaw}`} className="hover:text-[#0050cb] focus:outline-none focus-visible:underline">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#0050cb] shrink-0" aria-hidden="true" />
              <a
                href={`https://wa.me/${whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0050cb] focus:outline-none focus-visible:underline"
              >
                WhatsApp: {BRAND_INFO.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#0050cb] shrink-0" aria-hidden="true" />
              <a href={`mailto:${supportEmail}`} className="hover:text-[#0050cb] focus:outline-none focus-visible:underline">
                {supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#0050cb] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{workingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-[1280px] border-t border-[#c2c6d8]/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#424656]">
        <p>© {new Date().getFullYear()} {brandName}. {t.footerCopyright}</p>
        <nav aria-label="Footer legal links" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {LEGAL_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="hover:text-[#0050cb] focus:outline-none focus-visible:underline"
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
