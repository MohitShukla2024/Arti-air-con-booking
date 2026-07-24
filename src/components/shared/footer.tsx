"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Snowflake, MapPin, Phone, Mail, Share2, Globe, Shield } from "lucide-react";
import { useSettingsStore } from "@/store/use-settings-store";
import { useLanguageStore } from "@/store/use-language-store";
import { useAuthStore } from "@/store/use-auth-store";
import { TRANSLATIONS } from "@/lib/translations";

export function Footer() {
  const { brandName, phone, supportEmail, address } = useSettingsStore();
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

  return (
    <footer className="bg-[#e0e3e5] dark:bg-[#eceef0] w-full py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center gap-8 border-t border-[#c2c6d8]/30">
      <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-left">
        {/* Brand Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066ff] rounded-lg flex items-center justify-center text-white">
              <Snowflake className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-bold text-[#0050cb]">
              {brandName}
            </span>
          </div>
          <p className="text-[#424656] text-sm leading-relaxed">
            {t.footerBrandDesc}
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#dae1ff]/40 flex items-center justify-center text-[#0050cb] hover:bg-[#0050cb] hover:text-white transition-all"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#dae1ff]/40 flex items-center justify-center text-[#0050cb] hover:bg-[#0050cb] hover:text-white transition-all"
            >
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-base font-bold text-[#191c1e] mb-6">
            {t.footerQuickLinksHeader}
          </h4>
          <ul className="space-y-3 text-sm text-[#424656]">
            <li>
              <Link href="/" className="hover:text-[#0050cb] transition-colors">
                {t.navHome}
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-[#0050cb] transition-colors">
                {t.navServices}
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-[#0050cb] transition-colors">
                {t.navPricing}
              </Link>
            </li>
            <li>
              <button onClick={handleBookNav} className="hover:text-[#0050cb] font-semibold transition-colors">
                {t.navBook}
              </button>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#0050cb] font-semibold transition-colors">
                {t.navLogin}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-display text-base font-bold text-[#191c1e] mb-6">
            {t.footerContactHeader}
          </h4>
          <ul className="space-y-3 text-sm text-[#424656]">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#0050cb] shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#0050cb] shrink-0" />
              <a href={`tel:${phoneRaw}`} className="hover:text-[#0050cb]">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#0050cb] shrink-0" />
              <a href={`mailto:${supportEmail}`} className="hover:text-[#0050cb]">
                {supportEmail}
              </a>
            </li>
            <li className="pt-2 border-t border-[#c2c6d8]/30">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0050cb] hover:underline"
              >
                <Shield className="w-4 h-4" /> Admin Portal Gateway
              </Link>
            </li>
          </ul>
        </div>

        {/* Map Card */}
        <div className="h-48 rounded-2xl overflow-hidden bg-[#e0e3e5] relative border border-[#c2c6d8]/30 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="w-10 h-10 text-[#0050cb]/50 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#424656]">
              Locate Us on Maps
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] border-t border-[#c2c6d8]/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#424656]">
        <p>© {new Date().getFullYear()} {brandName}. All Rights Reserved.</p>
        <div className="flex gap-4">
          <Link href="/admin/login" className="hover:text-[#0050cb]">Admin Login</Link>
          <Link href="/admin/dashboard" className="hover:text-[#0050cb]">Admin Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
