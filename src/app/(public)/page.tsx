"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Phone,
  CheckCircle,
  Award,
  ArrowRight,
  Snowflake,
  AppWindow,
  Building2,
  Wrench,
  Gauge,
  Sparkles,
  Cpu,
  Droplets,
  Activity,
  Fan,
  Settings,
  Archive,
  Star,
  ShieldCheck,
} from "lucide-react";
import { TrustBadgesSection } from "@/components/shared/trust-badges-section";
import { ProcessStepsSection } from "@/components/shared/process-steps-section";
import { FAQSection } from "@/components/shared/faq-section";
import { PRICING_PLANS, SERVICES_LIST, TESTIMONIALS_LIST } from "@/lib/constants";
import { useBookingStore } from "@/store/use-booking-store";
import { useSettingsStore } from "@/store/use-settings-store";
import { useLanguageStore } from "@/store/use-language-store";
import { useAuthStore } from "@/store/use-auth-store";
import { TRANSLATIONS } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  Snowflake,
  AppWindow,
  Building2,
  Wrench,
  Gauge,
  Sparkles,
  Cpu,
  Droplets,
  Activity,
  Fan,
  Settings,
  Archive,
};

export default function HomePage() {
  const router = useRouter();
  const { setSelectedService } = useBookingStore();
  const { emergencyPhone, baseServiceFee, gasRefillFee } = useSettingsStore();
  const { language } = useLanguageStore();

  const { isAuthenticated } = useAuthStore();

  const t = TRANSLATIONS[language];

  const handleBookService = (serviceTitle?: string) => {
    if (serviceTitle) {
      setSelectedService(serviceTitle);
    }
    // Guard: guest users must login first before booking
    if (!isAuthenticated) {
      router.push("/login?redirect=/book");
      return;
    }
    router.push("/book");
  };

  return (
    <div className="space-y-12 sm:space-y-20 lg:space-y-24 pb-12 sm:pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-4 sm:pt-8 lg:pt-16 pb-8 sm:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#dae1ff] text-[#001849] text-[11px] sm:text-xs font-bold tracking-wide">
              <Award className="w-4 h-4 text-[#0050cb] shrink-0" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191c1e] tracking-tight leading-[1.15]">
              {t.heroTitle}
            </h1>

            <p className="text-[#424656] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => handleBookService()}>
                {t.heroBookCta} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href={`tel:${emergencyPhone}`} className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Phone className="w-5 h-5 mr-2 text-[#0050cb]" />
                  {t.heroCallCta}: {emergencyPhone}
                </Button>
              </a>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 sm:pt-8 border-t border-[#c2c6d8]/30 max-w-lg mx-auto lg:mx-0">
              <div className="text-center sm:text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-[#0050cb]">15,000+</p>
                <p className="text-[11px] sm:text-xs text-[#424656] font-medium">ACs Serviced</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-[#0050cb]">4.9 ★</p>
                <p className="text-[11px] sm:text-xs text-[#424656] font-medium">Rating</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-xl sm:text-2xl font-bold text-[#0050cb]">30 Min</p>
                <p className="text-[11px] sm:text-xs text-[#424656] font-medium">Response</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0px_8px_40px_rgba(0,102,255,0.12)] border-4 border-white">
              <Image
                src="/hero-technician.png"
                alt="Arti Air Con Certified Technician"
                fill
                priority
                quality={95}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001849]/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0066ff] flex items-center justify-center text-white font-bold">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191c1e]">100% Genuine Spare Parts</p>
                    <p className="text-[11px] text-[#424656]">Manufacturer Warranted Service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Factors & Bento Section */}
      <TrustBadgesSection />

      {/* 3. Services Grid Section */}
      <section id="services" className="max-w-[1280px] mx-auto px-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-[#0050cb] uppercase tracking-widest">
            {t.servicesTag}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#191c1e]">
            {t.servicesTitle}
          </h2>
          <p className="text-[#424656] text-sm sm:text-base">
            {t.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_LIST.map((service, idx) => {
            const IconComponent = iconMap[service.icon] || Snowflake;
            const serviceKey = `service_${idx + 1}_title` as keyof typeof t;
            const descKey = `service_${idx + 1}_desc` as keyof typeof t;
            const displayTitle = (t[serviceKey] as string) || service.title;
            const displayDesc = (t[descKey] as string) || service.description;

            return (
              <div
                key={service.id}
                onClick={() => handleBookService(displayTitle)}
                className="bg-white p-8 rounded-3xl border border-[#c2c6d8]/30 shadow-[0px_4px_20px_rgba(0,102,255,0.04)] hover:shadow-[0px_8px_30px_rgba(0,102,255,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#dae1ff]/40 text-[#0066ff] flex items-center justify-center group-hover:bg-[#0066ff] group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {service.price && (
                      <span className="px-3 py-1 bg-[#f0f4f9] text-[#0050cb] font-bold text-[11px] rounded-full border border-[#0050cb]/20 group-hover:bg-[#0050cb] group-hover:text-white transition-colors">
                        {service.price}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#191c1e]">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-[#424656] leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
                <div className="pt-6 flex items-center justify-between text-xs font-bold text-[#0050cb] group-hover:translate-x-1 transition-transform">
                  <span>{t.navBook}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Process Steps Section */}
      <ProcessStepsSection />

      {/* 5. Dynamic Pricing Section */}
      <section id="pricing" className="max-w-[1280px] mx-auto px-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-[#0050cb] uppercase tracking-widest">
            {t.pricingTag}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#191c1e]">
            {t.pricingTitle}
          </h2>
          <p className="text-[#424656] text-sm sm:text-base">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-3xl shadow-lg border flex flex-col justify-between relative transition-all duration-300 ${
                plan.featured
                  ? "bg-[#0066ff] text-white border-4 border-white shadow-2xl transform lg:-translate-y-2"
                  : "bg-white text-[#191c1e] border-[#c2c6d8]/30"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                    plan.featured ? "bg-[#fff6f4] text-[#a33200]" : "bg-[#dae1ff] text-[#0050cb]"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                {plan.subBadge && (
                  <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${plan.featured ? "opacity-80" : "text-[#0050cb]"}`}>
                    {plan.subBadge}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold mb-3">{plan.title}</h3>
                <p className="text-3xl font-extrabold mb-4">
                  {plan.id === "ac-service" ? `₹${baseServiceFee}` : plan.id === "ac-installation" ? `₹${gasRefillFee}` : plan.price}{" "}
                  <span className={`text-xs font-normal ${plan.featured ? "opacity-80" : "text-[#424656]"}`}>
                    {plan.unit}
                  </span>
                </p>

                {plan.description && (
                  <p className={`text-xs leading-relaxed mb-4 ${plan.featured ? "opacity-90" : "text-[#424656]"}`}>
                    {plan.description}
                  </p>
                )}

                <ul className="space-y-2.5 mb-6 text-xs font-semibold">
                  {plan.features?.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.featured ? "text-white" : "text-[#0050cb]"}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.inclusions && (
                  <div className={`mb-6 pt-3 border-t text-[11px] ${plan.featured ? "border-white/20" : "border-[#c2c6d8]/20"}`}>
                    <p className={`font-bold mb-1.5 ${plan.featured ? "text-white" : "text-[#191c1e]"}`}>Included:</p>
                    <ul className="space-y-1">
                      {plan.inclusions.map((inc) => (
                        <li key={inc} className="flex items-center gap-1.5">
                          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${plan.featured ? "text-emerald-300" : "text-emerald-600"}`} />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                variant={plan.featured ? "white" : "secondary"}
                fullWidth
                onClick={() => handleBookService(plan.title)}
              >
                {plan.ctaText}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Verified Customer Testimonials & Reviews Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>4.9 / 5 Stars Verified Customer Reviews</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#191c1e]">
            Trusted by 15,000+ Families
          </h2>
          <p className="text-[#424656] text-sm sm:text-base">
            See real feedback from verified homeowners and office clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_LIST.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-[#c2c6d8]/30 shadow-[0px_4px_20px_rgba(0,102,255,0.04)] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#727687]">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs text-[#191c1e] leading-relaxed italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#c2c6d8]/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#191c1e]">{item.name}</h4>
                  <p className="text-[11px] text-[#727687]">{item.location}</p>
                </div>
                <span className="text-[10px] font-bold text-[#0050cb] bg-[#dae1ff]/40 px-2 py-0.5 rounded-full">
                  Verified Booking
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <FAQSection />
    </div>
  );
}
