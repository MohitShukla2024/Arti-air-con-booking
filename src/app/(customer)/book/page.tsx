"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Fan,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Calendar,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BRAND_INFO,
  SERVICE_OPTIONS,
  AC_TYPE_OPTIONS,
  AC_BRAND_OPTIONS,
} from "@/lib/constants";
import { useBookingStore } from "@/store/use-booking-store";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { bookingFormSchema } from "@/validators/booking.schema";

function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ServiceBookingPage() {
  const router = useRouter();
  const { selectedService, setSelectedService, addBooking } = useBookingStore();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  // AUTH GUARD: Unauthenticated users must login first
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to book a service.");
      router.replace("/login?redirect=/book");
    }
  }, [isAuthenticated, router]);

  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedBookingCode, setGeneratedBookingCode] = useState("");

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
    altMobile: "",
    fullAddress: user?.address || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
    serviceType: selectedService || "Jet Cleaning",
    acType: "Split AC",
    acBrand: "Daikin",
    problemDescription: "",
    preferredDateTime: getCurrentDateTimeLocal(),
    termsAccepted: true,
    isGSTBilling: false,
    companyName: "Arti air con",
    gstin: "",
  });

  // Pre-fill saved profile details from localStorage/user session
  useEffect(() => {
    if (user) {
      const storageKey = `customer_profile_${user.id || user.mobileNumber}`;
      let saved: Record<string, unknown> = {};
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
        if (raw) saved = JSON.parse(raw) as Record<string, unknown>;
      } catch (err) {
        console.error("Error reading saved profile for booking:", err);
      }

      const timer = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          fullName: (saved.fullName as string) || user.fullName || prev.fullName,
          email: (saved.email as string) || user.email || prev.email,
          mobileNumber: user.mobileNumber || prev.mobileNumber,
          fullAddress: (saved.address as string) || user.address || prev.fullAddress,
          city: (saved.city as string) || user.city || prev.city,
          pincode: (saved.pincode as string) || user.pincode || prev.pincode,
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to proceed with booking.");
      router.push("/login?redirect=/book");
      return;
    }
    setFormStep(2);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to complete your booking.");
      router.push("/login?redirect=/book");
      return;
    }

    const payload = {
      ...formData,
      serviceType: selectedService || formData.serviceType,
      preferredDateTime: formData.preferredDateTime || new Date().toISOString(),
    };

    const validation = bookingFormSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstErrorMsg = Object.values(fieldErrors)[0]?.[0];
      toast.error(firstErrorMsg || "Please fill in all fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      // POST to backend API route so both Customer & Admin Dashboards sync live
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceType: selectedService || formData.serviceType,
          preferredDateTime: formData.preferredDateTime || new Date().toISOString(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired or unauthorized. Please log in first.");
        router.push("/login?redirect=/book");
        return;
      }

      const data = await res.json();

      if (data.success && data.booking) {
        setGeneratedBookingCode(data.booking.bookingCode);
        addBooking(data.booking);
        setIsSubmitted(true);
        toast.success(`Booking ${data.booking.bookingCode} submitted successfully!`);
      } else {
        toast.error(data.message || "Failed to submit booking.");
      }
    } catch {
      toast.error("Error submitting booking. Please try again.");
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  const handleBookAnother = () => {
    setIsSubmitted(false);
    setSelectedService("");
    setFormData((prev) => ({
      ...prev,
      problemDescription: "",
      preferredDateTime: "",
    }));
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#0050cb] animate-spin" />
        <p className="text-sm font-semibold text-[#424656]">
          Checking authentication status...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dae1ff] text-[#001849] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#0050cb]" />
          Certified Technicians
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-[#191c1e]">
          Book Your Service
        </h1>
        <p className="text-[#424656] text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
          Experience the ultimate cooling relief. Fill out the form below and our professional team will reach out to confirm your slot within 30 minutes.
        </p>
      </div>

      {/* Booking Form or Success Container */}
      <div className="max-w-3xl mx-auto">
        {!isSubmitted ? (
          <div className="bg-white rounded-[2rem] shadow-[0px_4px_40px_rgba(0,102,255,0.08)] p-5 sm:p-8 md:p-12 border border-[#c2c6d8]/30">
            {/* Step Progress Bar Header */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0050cb]">
                <span>{formStep === 1 ? "Step 1 of 2: Contact & Service" : "Step 2 of 2: Address & Schedule"}</span>
                <span>{formStep === 1 ? "50% Complete" : "100% Complete"}</span>
              </div>
              <div className="w-full bg-[#e0e3e5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0066ff] h-full transition-all duration-500"
                  style={{ width: formStep === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            <form onSubmit={formStep === 1 ? handleNextStep : handleSubmit} className="space-y-6 sm:space-y-8">
              {/* STEP 1: Personal & Service Info */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#c2c6d8]/30 pb-3 sm:pb-4">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-[#dae1ff]/40 text-[#0066ff]">
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#191c1e]">
                        1. Personal Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="fullname"
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        />
                      </div>
                    </div>

                    {/* GST Tax Invoice Toggle (B2B Commercial Option) */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#0050cb]">
                        <input
                          type="checkbox"
                          checked={formData.isGSTBilling}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isGSTBilling: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#0066ff] focus:ring-[#0066ff]"
                        />
                        <span>Require GST Tax Invoice for Business / Corporate Billing?</span>
                      </label>

                      {formData.isGSTBilling && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-[#f0f4f9] rounded-2xl border border-[#0050cb]/20 animate-in fade-in duration-200">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#424656]">Company Name *</label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              placeholder="e.g. Acme Technologies Pvt Ltd"
                              className="w-full bg-white border border-[#c2c6d8] rounded-xl p-3 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#424656]">GSTIN Number *</label>
                            <input
                              type="text"
                              name="gstin"
                              value={formData.gstin}
                              onChange={handleChange}
                              placeholder="e.g. 07AAAAA0000A1Z5"
                              className="w-full bg-white border border-[#c2c6d8] rounded-xl p-3 text-xs outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6 pt-4">
                    <div className="flex items-center gap-3 border-b border-[#c2c6d8]/30 pb-3 sm:pb-4">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-[#dae1ff]/40 text-[#0066ff]">
                        <Fan className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#191c1e]">
                        2. Service Required
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          Service Type *
                        </label>
                        <select
                          name="serviceType"
                          value={selectedService || formData.serviceType}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        >
                          {SERVICE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          AC Type *
                        </label>
                        <select
                          name="acType"
                          value={formData.acType}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        >
                          {AC_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          AC Brand *
                        </label>
                        <select
                          name="acBrand"
                          value={formData.acBrand}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        >
                          {AC_BRAND_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" fullWidth>
                    Continue to Step 2 (Address & Slot) →
                  </Button>
                </div>
              )}

              {/* STEP 2: Address & Preferred Slot */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#c2c6d8]/30 pb-3 sm:pb-4">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-[#dae1ff]/40 text-[#0066ff]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#191c1e]">
                        3. Service Address
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#424656] px-1">
                        Full Address *
                      </label>
                      <textarea
                        name="fullAddress"
                        rows={3}
                        value={formData.fullAddress}
                        onChange={handleChange}
                        placeholder="House/Flat No., Street, Sector/Area, Landmark"
                        required
                        className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all resize-none text-[#191c1e]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="Pincode"
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        />
                      </div>
                    </div>

                    {/* Step 4: Preferred Date & Time Slot */}
                    <div className="space-y-4 pt-4 border-t border-[#c2c6d8]/20">
                      <div className="flex items-center gap-3 pb-2">
                        <div className="p-2 rounded-xl bg-[#dae1ff]/40 text-[#0066ff]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-[#191c1e]">
                            4. Preferred Service Date & Time
                          </h3>
                          <p className="text-xs text-[#727687]">
                            Specify when you want our technician to arrive
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#424656] px-1">
                          Select Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="preferredDateTime"
                          value={formData.preferredDateTime}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#f2f4f6] border border-[#c2c6d8] rounded-xl p-3.5 sm:p-4 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] focus:border-[#0066ff] outline-none transition-all text-[#191c1e]"
                        />
                        <p className="text-[11px] text-[#727687] px-1">
                          • Defaults to your exact booking time. You can adjust this to any future preferred slot.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormStep(1)}
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Confirming Booking..." : "Confirm & Book Service Now"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* SUCCESS VIEW */
          <div className="bg-white rounded-[2rem] shadow-[0px_4px_40px_rgba(0,102,255,0.08)] p-12 border border-[#c2c6d8]/30 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#0066ff]/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-[#0066ff] blur-2xl opacity-20 animate-pulse rounded-full" />
              <CheckCircle2 className="w-24 h-24 text-[#0066ff] relative block mx-auto" />
            </div>

            <h2 className="font-display text-3xl font-bold text-[#191c1e] mb-2">
              Booking Submitted Successfully!
            </h2>
            <p className="text-[#424656] text-base mb-8 max-w-sm mx-auto">
              Thank you for choosing Arti Air Con. Our technician will contact you shortly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-[#f2f4f6] p-6 rounded-2xl border border-[#c2c6d8]/20">
                <p className="text-xs text-[#424656] uppercase tracking-wider mb-1 font-semibold">
                  Booking ID
                </p>
                <p className="font-display text-2xl text-[#0050cb] font-bold">
                  {generatedBookingCode || "#ART-2024-8921"}
                </p>
              </div>

              <div className="bg-[#f2f4f6] p-6 rounded-2xl border border-[#c2c6d8]/20">
                <p className="text-xs text-[#424656] uppercase tracking-wider mb-1 font-semibold">
                  Current Status
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 bg-[#a33200] rounded-full animate-pulse" />
                  <p className="font-display text-2xl text-[#a33200] font-bold">
                    Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button variant="secondary" onClick={handleBookAnother}>
                Book Another
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Track My Service
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bento Info Grid (Trust Factors) */}
      <section className="max-w-[1280px] mx-auto pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-8 lg:p-10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center border border-[#c2c6d8]/20">
            <div className="relative w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden bg-[#e0e3e5] shadow-md">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArIzaTs3SIxv-E-LEreqsUzP44_ueAoJh0j9Ze3LGVH9VBLoyZtTk5VQ0ZoOQZUR9Py_p9gA8Io5szAay4wjTPgVTvNFZDyML1A44aF_oQJgNN08MFep9DpYPkgdvwLmZ_6dfajYukjwtULlXpYcPp_Uu6OZFwVmyMzOCwmU2_tIq9A4MPwV-SC4J_kySPOB01mD0ewpq0pQSPpdmrWDalLs3Zm3K2e4AT_yCR74rTb72iE1Gx73pT"
                alt="Verified Technician"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h4 className="font-display text-2xl font-bold text-[#191c1e]">
                Verified Professionals
              </h4>
              <p className="text-sm text-[#424656] leading-relaxed">
                Every technician in our network undergoes a rigorous 5-step background check and technical skill certification. We don&apos;t just fix ACs; we ensure peace of mind.
              </p>
              <ul className="space-y-2 text-sm font-semibold text-[#191c1e]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0050cb]" />
                  Certified for 20+ Global Brands
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0050cb]" />
                  90-Day Service Warranty
                </li>
              </ul>
            </div>
          </div>

          {/* Bento 2: Emergency */}
          <div className="bg-[#0066ff] p-8 lg:p-10 rounded-[2rem] text-white flex flex-col justify-between shadow-xl">
            <PhoneCall className="w-12 h-12" />
            <div className="space-y-4 mt-8">
              <h4 className="font-display text-2xl font-bold">Emergency Support?</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                AC stopped working in the middle of a heatwave? We prioritize urgent repairs with our Express Lane service.
              </p>
              <a href={`tel:${BRAND_INFO.emergencyPhone}`} className="block">
                <Button variant="white" fullWidth>
                  Call {BRAND_INFO.emergencyPhone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
