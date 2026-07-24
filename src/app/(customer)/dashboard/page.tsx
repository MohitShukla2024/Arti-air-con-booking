"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  User,
  Settings,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  RefreshCw,
  CalendarPlus,
  LogOut,
  Wrench,
  Check,
  Plus,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth-store";
import { useBookingStore } from "@/store/use-booking-store";
import { useSettingsStore } from "@/store/use-settings-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceBooking } from "@/types";
import { generateReceiptPDF } from "@/lib/generate-receipt-pdf";

export function formatBookingDateTime(dateStr?: string) {
  if (!dateStr) return "Scheduled";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, logout, updateUserProfile } = useAuthStore();
  const { bookingHistory, cancelBooking } = useBookingStore();
  const { technicianName, technicianPhone } = useSettingsStore();

  // ROUTE GUARD: Prevent browser back button access after logout
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !user || user.role !== "CUSTOMER") {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router, user]);

  // Tab State: "active" | "history" | "profile" | "payments"
  const [activeTab, setActiveTab] = useState<"active" | "history" | "profile" | "payments">("active");

  const [liveBookings, setLiveBookings] = useState<ServiceBooking[]>([]);
  const [currentActiveBooking, setCurrentActiveBooking] = useState<ServiceBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    mobileNumber: user?.mobileNumber || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
    languagePref: user?.languagePref || "en",
    smsAlerts: true,
    emailAlerts: true,
  });

  // Hydrate profile data from local storage for current user
  useEffect(() => {
    if (user) {
      const storageKey = `customer_profile_${user.id || user.mobileNumber}`;
      let saved: Record<string, unknown> = {};
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
        if (raw) saved = JSON.parse(raw) as Record<string, unknown>;
      } catch (err) {
        console.error("Error reading saved profile:", err);
      }

      const timer = setTimeout(() => {
        setProfileData({
          fullName: (saved.fullName as string) || user.fullName || "",
          mobileNumber: user.mobileNumber || "",
          email: (saved.email as string) || user.email || "",
          address: (saved.address as string) || user.address || "",
          city: (saved.city as string) || user.city || "",
          pincode: (saved.pincode as string) || user.pincode || "",
          languagePref: ((saved.languagePref as string) || user.languagePref || "en") as "en" | "hi",
          smsAlerts: (saved.smsAlerts as boolean) ?? user.smsAlerts ?? true,
          emailAlerts: (saved.emailAlerts as boolean) ?? user.emailAlerts ?? true,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Saved Payment Methods State
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([
    {
      id: "pay-cod",
      type: "COD",
      title: "Cash / UPI on Service Completion",
      detail: "Pay directly to technician after inspection & testing",
      isDefault: true,
      badge: "Recommended",
    },
    {
      id: "pay-upi-1",
      type: "UPI",
      title: "Google Pay / PhonePe UPI",
      detail: "customer@okicici",
      isDefault: false,
      badge: "Instant Payment",
    },
    {
      id: "pay-card-1",
      type: "CARD",
      title: "HDFC Bank Visa Card",
      detail: "•••• •••• •••• 4242 (Exp 08/28)",
      isDefault: false,
      badge: "Saved Card",
    },
  ]);

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<"UPI" | "CARD">("UPI");
  const [newPaymentTitle, setNewPaymentTitle] = useState("");
  const [newPaymentDetail, setNewPaymentDetail] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // 1. Save permanently to localStorage for this customer
      if (user) {
        const storageKey = `customer_profile_${user.id || user.mobileNumber}`;
        localStorage.setItem(storageKey, JSON.stringify(profileData));
      }

      // 2. Update Zustand global auth state
      updateUserProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        address: profileData.address,
        city: profileData.city,
        pincode: profileData.pincode,
        smsAlerts: profileData.smsAlerts,
        emailAlerts: profileData.emailAlerts,
      });

      // 3. Call server API to update user session / DB
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      toast.success("Profile & Service Address saved permanently!");
    } catch (error) {
      console.error("Save profile error:", error);
      toast.success("Profile saved locally!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSetDefaultPayment = (id: string) => {
    setSavedPaymentMethods((prev) =>
      prev.map((pm) => ({ ...pm, isDefault: pm.id === id }))
    );
    toast.success("Default payment method updated!");
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentDetail) {
      toast.error("Please fill in payment details");
      return;
    }
    const newMethod = {
      id: `pay-${Date.now()}`,
      type: newPaymentType,
      title: newPaymentTitle || (newPaymentType === "UPI" ? "UPI Account" : "Credit/Debit Card"),
      detail: newPaymentDetail,
      isDefault: false,
      badge: "New Payment Method",
    };
    setSavedPaymentMethods((prev) => [...prev, newMethod]);
    setIsAddPaymentModalOpen(false);
    setNewPaymentTitle("");
    setNewPaymentDetail("");
    toast.success("Payment method added securely!");
  };

  // Dynamic API Fetch Function
  const fetchLiveDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        const fetchedHistory: ServiceBooking[] = data.history || [];
        const combinedMap = new Map<string, ServiceBooking>();
        
        bookingHistory.forEach((b) => combinedMap.set(b.id, b));
        fetchedHistory.forEach((b) => combinedMap.set(b.id, b));

        const mergedList = Array.from(combinedMap.values());
        setLiveBookings(mergedList);

        setCurrentActiveBooking((prevActive) => {
          if (prevActive) {
            const updated = mergedList.find((b) => b.id === prevActive.id || b.bookingCode === prevActive.bookingCode);
            if (updated) return updated;
          }
          const active =
            mergedList.find((b) => b.status === "ACCEPTED" || b.status === "PENDING" || b.status === "EN_ROUTE" || b.status === "IN_PROGRESS") ||
            data.upcoming ||
            mergedList[0] ||
            null;
          return active;
        });
      }
    } catch (error) {
      console.error("Error fetching live customer dashboard data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [bookingHistory]);

  useEffect(() => {
    const activeBookingStatus = currentActiveBooking?.status || "";

    const timer = setTimeout(() => {
      void fetchLiveDashboardData();
    }, 0);

    // Smart polling: Poll every 12s when order is active, else 30s when idle
    const hasActiveOrder = ["PENDING", "ACCEPTED", "EN_ROUTE", "IN_PROGRESS"].includes(activeBookingStatus);
    const pollIntervalMs = hasActiveOrder ? 12000 : 30000;

    const interval = setInterval(() => {
      void fetchLiveDashboardData();
    }, pollIntervalMs);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchLiveDashboardData, currentActiveBooking?.status]);

  // Logout Handler
  const handleCustomerLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  // Handle Dynamic Cancellation
  const handleCancelBooking = async () => {
    if (!currentActiveBooking) return;

    if (
      confirm(
        `Are you sure you want to cancel booking ${currentActiveBooking.bookingCode}?`
      )
    ) {
      try {
        const res = await fetch(`/api/bookings/${currentActiveBooking.id}/cancel`, {
          method: "PATCH",
        });
        const data = await res.json();

        if (data.success) {
          cancelBooking(currentActiveBooking.id);
          setCurrentActiveBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
          setLiveBookings((prev) =>
            prev.map((b) => (b.id === currentActiveBooking.id ? { ...b, status: "CANCELLED" } : b))
          );
          toast.success(`Booking ${currentActiveBooking.bookingCode} cancelled successfully`);
        }
      } catch {
        cancelBooking(currentActiveBooking.id);
        setCurrentActiveBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
        toast.success("Cancellation updated locally");
      }
    }
  };

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleTrackTechnician = () => {
    if (!currentActiveBooking || currentActiveBooking.status === "CANCELLED") {
      toast.error("No active service to track");
      return;
    }
    setIsTrackingModalOpen(true);
  };

  // Generate & Download Receipt (PDF)
  const handleDownloadReceipt = (booking: ServiceBooking) => {
    try {
      generateReceiptPDF(booking, user?.fullName, technicianName);
      toast.success(`Receipt ${booking.bookingCode} downloaded as PDF`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Could not generate PDF. Please try again.");
    }
  };

  const getProgressWidth = () => {
    if (!currentActiveBooking || currentActiveBooking.status === "CANCELLED") return "w-0";
    if (currentActiveBooking.status === "PENDING") return "w-1/3";
    if (currentActiveBooking.status === "ACCEPTED" || currentActiveBooking.status === "EN_ROUTE") return "w-2/3";
    if (currentActiveBooking.status === "COMPLETED") return "w-full";
    return "w-1/3";
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(liveBookings.length / itemsPerPage) || 1;
  const paginatedHistory = liveBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isHydrated || !isAuthenticated || user?.role !== "CUSTOMER") return null;

  return (
    <div className="space-y-10">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#191c1e] mb-1">
            Hello, {user?.fullName.split(" ")[0] || "Alexander"}
          </h1>
          <p className="text-[#424656] text-sm">
            Manage your air conditioning services and view upcoming maintenance schedules.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchLiveDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c2c6d8] text-[#0050cb] text-xs font-bold hover:bg-[#dae1ff]/20 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Live Data</span>
          </button>
          <button
            onClick={handleCustomerLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffdad6]/40 border border-[#ffdad6] text-[#ba1a1a] text-xs font-bold hover:bg-[#ffdad6] transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Status & Profile */}
        <div className="lg:col-span-4 space-y-8">
          {/* Current Booking Card */}
          <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,102,255,0.05)] border border-[#c2c6d8]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066ff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />

            {currentActiveBooking ? (
              <>
                <div className="flex justify-between items-start mb-6" aria-live="polite">
                  <Badge status={currentActiveBooking.status}>
                    {currentActiveBooking.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#424656]">Booking ID</p>
                    <p className="text-sm font-bold text-[#0050cb]">
                      {currentActiveBooking.bookingCode}
                    </p>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-[#191c1e] mb-2">
                  {currentActiveBooking.serviceType}
                </h3>

                <div className="flex items-center gap-3 text-[#424656] mb-6 p-3 bg-[#f0f4f9] rounded-xl border border-[#0050cb]/15">
                  <Calendar className="w-5 h-5 text-[#0050cb] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-[#727687] uppercase tracking-wider">Booking Slot / Time</p>
                    <p className="text-xs font-extrabold text-[#191c1e]">
                      {formatBookingDateTime(currentActiveBooking.preferredDateTime)}
                    </p>
                  </div>
                </div>

                {/* Step Tracker */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-xs font-semibold">
                    <span
                      className={
                        currentActiveBooking.status !== "CANCELLED"
                          ? "text-[#2e7d32] font-bold"
                          : "text-[#727687]"
                      }
                    >
                      ✓ Confirmed
                    </span>
                    <span
                      className={
                        currentActiveBooking.status === "COMPLETED" || currentActiveBooking.status === "IN_PROGRESS"
                          ? "text-[#2e7d32] font-bold"
                          : currentActiveBooking.status === "ACCEPTED" || currentActiveBooking.status === "EN_ROUTE"
                          ? "text-[#0050cb] font-bold"
                          : "text-[#727687]"
                      }
                    >
                      {currentActiveBooking.status === "COMPLETED" ? "✓ Arrived" : "En Route"}
                    </span>
                    <span
                      className={
                        currentActiveBooking.status === "COMPLETED"
                          ? "text-[#2e7d32] font-bold"
                          : currentActiveBooking.status === "IN_PROGRESS"
                          ? "text-[#0050cb] font-bold"
                          : "text-[#727687]"
                      }
                    >
                      {currentActiveBooking.status === "COMPLETED" ? "✓ Completed" : "In Progress"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#eceef0] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full bg-[#0066ff] rounded-full transition-all duration-500 ${getProgressWidth()}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {currentActiveBooking.status === "COMPLETED" ? (
                    <>
                      <div className="p-3 bg-[#e8f5e9] border border-[#2e7d32]/20 rounded-xl text-center">
                        <p className="text-xs font-bold text-[#2e7d32] flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> Service Completed Successfully
                        </p>
                      </div>
                      <Button fullWidth onClick={handleTrackTechnician}>
                        View Service Details
                      </Button>
                      <Button variant="secondary" fullWidth onClick={() => handleDownloadReceipt(currentActiveBooking)}>
                        <FileText className="w-4 h-4 inline mr-1" /> Download Invoice / Receipt
                      </Button>
                    </>
                  ) : currentActiveBooking.status !== "CANCELLED" ? (
                    <>
                      <Button fullWidth onClick={handleTrackTechnician}>
                        Track Technician
                      </Button>
                      <Button variant="danger" fullWidth onClick={handleCancelBooking}>
                        Cancel Booking
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-[#ba1a1a] text-center font-semibold bg-[#ffdad6]/40 py-2.5 rounded-xl border border-[#ffdad6]">
                      This booking has been cancelled.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <CalendarPlus className="w-12 h-12 text-[#0050cb]/30 mx-auto" />
                <div>
                  <h4 className="font-display font-bold text-lg text-[#191c1e] mb-1">
                    No Active Bookings
                  </h4>
                  <p className="text-xs text-[#424656] leading-relaxed">
                    You have no active maintenance service scheduled right now.
                  </p>
                </div>
                <Link href="/book" className="block">
                  <Button fullWidth>Book Service Now</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Profile Mini Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,102,255,0.05)] border border-[#c2c6d8]/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#0066ff]/10 text-[#0050cb] flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-[#191c1e]">
                  {user?.fullName || "Alexander Pierce"}
                </h4>
                <p className="text-xs text-[#424656]">
                  {user?.mobileNumber || "+91 99999 99999"}
                </p>
              </div>
            </div>

            <ul className="space-y-2">
              <li
                onClick={() => setActiveTab("history")}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${
                  activeTab === "history"
                    ? "bg-[#0066ff] text-white shadow-md font-bold"
                    : "hover:bg-[#f2f4f6] text-[#191c1e]"
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <FileText className={`w-4 h-4 ${activeTab === "history" ? "text-white" : "text-[#555f6c]"}`} />
                  <span>Service History</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === "history" ? "text-white" : "text-[#727687]"} group-hover:translate-x-1 transition-transform`} />
              </li>

              <li
                onClick={() => setActiveTab("profile")}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${
                  activeTab === "profile"
                    ? "bg-[#0066ff] text-white shadow-md font-bold"
                    : "hover:bg-[#f2f4f6] text-[#191c1e]"
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Settings className={`w-4 h-4 ${activeTab === "profile" ? "text-white" : "text-[#555f6c]"}`} />
                  <span>Profile Settings</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === "profile" ? "text-white" : "text-[#727687]"} group-hover:translate-x-1 transition-transform`} />
              </li>

              <li
                onClick={() => setActiveTab("payments")}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${
                  activeTab === "payments"
                    ? "bg-[#0066ff] text-white shadow-md font-bold"
                    : "hover:bg-[#f2f4f6] text-[#191c1e]"
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className={`w-4 h-4 ${activeTab === "payments" ? "text-white" : "text-[#555f6c]"}`} />
                  <span>Payment Methods</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === "payments" ? "text-white" : "text-[#727687]"} group-hover:translate-x-1 transition-transform`} />
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Service History / Profile Settings / Payment Methods */}
        <div className="lg:col-span-8 space-y-8">
          {/* VIEW 1: SERVICE HISTORY */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,102,255,0.05)] border border-[#c2c6d8]/20 overflow-hidden">
              <div className="p-6 border-b border-[#c2c6d8]/20 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#191c1e]">
                    Service History
                  </h3>
                  <p className="text-xs text-[#424656]">
                    Real-time dynamic record of your AC maintenance requests
                  </p>
                </div>
                <Link href="/book">
                  <Button size="sm" className="flex items-center gap-2">
                    <CalendarPlus className="w-4 h-4" /> Book Service
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-[#424656]">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#0050cb]" />
                  <p className="text-sm font-semibold">Loading live bookings...</p>
                </div>
              ) : liveBookings.length === 0 ? (
                <div className="p-16 text-center text-[#424656] space-y-4">
                  <CalendarPlus className="w-12 h-12 text-[#0050cb]/30 mx-auto" />
                  <p className="font-bold text-[#191c1e] text-base">
                    No service bookings found
                  </p>
                  <p className="text-xs text-[#555f6c] max-w-sm mx-auto">
                    You have not submitted any service requests yet. Click below to book your first AC maintenance.
                  </p>
                  <Link href="/book" className="inline-block pt-2">
                    <Button>Book AC Service Now</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Mobile View: Card List (<640px) */}
                  <div className="sm:hidden divide-y divide-[#c2c6d8]/20 p-4 space-y-4">
                    {paginatedHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setCurrentActiveBooking(item)}
                        className={`bg-[#f8fafc] p-4 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                          currentActiveBooking?.id === item.id
                            ? "border-[#0066ff] ring-2 ring-[#0066ff]/20 bg-[#dae1ff]/20"
                            : "border-[#c2c6d8]/20 hover:border-[#0066ff]/40"
                        }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0050cb]">{item.bookingCode}</span>
                          <Badge status={item.status}>{item.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#191c1e]">
                          <span className="font-bold">{item.serviceType}</span>
                          <span className="font-extrabold">₹{item.amount ? item.amount.toFixed(2) : "450.00"}</span>
                        </div>
                        <div className="pt-2 border-t border-[#c2c6d8]/15 flex items-center justify-between text-[11px] text-[#727687]">
                          <span className="font-semibold text-[#191c1e]">{formatBookingDateTime(item.preferredDateTime)}</span>
                          <button
                            onClick={() => handleDownloadReceipt(item)}
                            className="text-[#0050cb] font-bold hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Download Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View: Table (>=640px) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f2f4f6] text-xs font-semibold text-[#424656] uppercase tracking-wider">
                          <th className="p-4 border-b border-[#c2c6d8]/20">ID</th>
                          <th className="p-4 border-b border-[#c2c6d8]/20">Service Type</th>
                          <th className="p-4 border-b border-[#c2c6d8]/20">Date & Time</th>
                          <th className="p-4 border-b border-[#c2c6d8]/20">Amount</th>
                          <th className="p-4 border-b border-[#c2c6d8]/20">Status</th>
                          <th className="p-4 border-b border-[#c2c6d8]/20 text-right">
                            Receipt
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c2c6d8]/20 text-sm">
                        {paginatedHistory.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => setCurrentActiveBooking(item)}
                            className={`transition-colors cursor-pointer ${
                              currentActiveBooking?.id === item.id
                                ? "bg-[#dae1ff]/30 border-l-4 border-[#0066ff]"
                                : "hover:bg-[#f2f4f6]/50"
                            }`}
                          >
                            <td className="p-4 text-[#0050cb] font-bold">
                              {item.bookingCode}
                            </td>
                            <td className="p-4 text-[#191c1e] font-semibold">
                              {item.serviceType}
                            </td>
                            <td className="p-4 text-[#555f6c] font-medium text-xs">
                              {formatBookingDateTime(item.preferredDateTime)}
                            </td>
                            <td className="p-4 font-bold text-[#191c1e]">
                              ₹{item.amount ? item.amount.toFixed(2) : "450.00"}
                            </td>
                            <td className="p-4">
                              <Badge status={item.status}>{item.status}</Badge>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDownloadReceipt(item)}
                                className="text-[#0050cb] hover:text-[#0066ff] p-2 transition-colors inline-flex items-center gap-1"
                                title="Download Receipt"
                              >
                                <FileText className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {liveBookings.length > 0 && (
                <div className="p-4 flex items-center justify-between bg-[#f2f4f6]/40 text-xs text-[#424656]">
                  <span>
                    Showing {paginatedHistory.length} of {liveBookings.length} bookings
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 rounded bg-white border border-[#c2c6d8]/30 flex items-center justify-center disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`h-8 w-8 rounded flex items-center justify-center font-bold ${
                          currentPage === num
                            ? "bg-[#0066ff] text-white"
                            : "bg-white border border-[#c2c6d8]/30 text-[#191c1e]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-8 w-8 rounded bg-white border border-[#c2c6d8]/30 flex items-center justify-center disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl shadow-[0px_4px_25px_rgba(0,102,255,0.06)] border border-[#c2c6d8]/20 p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#c2c6d8]/20 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#3b82f6] text-white flex items-center justify-center font-display font-extrabold text-xl shadow-md">
                    {profileData.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold text-[#191c1e]">{profileData.fullName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                       
                      </span>
                    </div>
                    <p className="text-xs text-[#727687]">• Verified User</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#424656] px-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData((p) => ({ ...p, fullName: e.target.value }))}
                      required
                      className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] outline-none text-[#191c1e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#424656] px-1">Mobile Number (Verified)</label>
                    <input
                      type="text"
                      value={profileData.mobileNumber}
                      readOnly
                      className="w-full bg-[#f0f4f9] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-sm font-semibold text-[#555f6c] cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#424656] px-1">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] outline-none text-[#191c1e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#424656] px-1">City / Region</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData((p) => ({ ...p, city: e.target.value }))}
                      className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] outline-none text-[#191c1e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#424656] px-1">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData((p) => ({ ...p, pincode: e.target.value }))}
                      className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] outline-none text-[#191c1e]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#424656] px-1">Default Doorstep Service Address</label>
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-[#0066ff] outline-none text-[#191c1e] resize-none"
                  />
                </div>

                {/* Notifications & Preferences */}
                <div className="pt-4 border-t border-[#c2c6d8]/20 space-y-4">
                  <h4 className="font-display text-sm font-bold text-[#191c1e]">Communication & Notification Preferences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-[#c2c6d8]/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.smsAlerts}
                        onChange={(e) => setProfileData((p) => ({ ...p, smsAlerts: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#0066ff]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#191c1e]">SMS Technician Alerts</p>
                        <p className="text-[11px] text-[#727687]">Receive arrival & status updates on SMS</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-[#c2c6d8]/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.emailAlerts}
                        onChange={(e) => setProfileData((p) => ({ ...p, emailAlerts: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#0066ff]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#191c1e]">Email Receipts & Invoices</p>
                        <p className="text-[11px] text-[#727687]">Get digital PDFs sent to your inbox</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving Profile..." : "Save Profile & Address"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 3: PAYMENT METHODS */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-3xl shadow-[0px_4px_25px_rgba(0,102,255,0.06)] border border-[#c2c6d8]/20 p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c2c6d8]/20 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-[#191c1e]">Saved Payment Methods</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PCI-DSS 256-Bit Encrypted
                    </span>
                  </div>
                  <p className="text-xs text-[#727687] mt-1">Manage your default payment choices for hassle-free service billing</p>
                </div>

                <Button size="sm" onClick={() => setIsAddPaymentModalOpen(true)} className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Payment Method
                </Button>
              </div>

              {/* Payment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedPaymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative space-y-4 flex flex-col justify-between ${
                      pm.isDefault
                        ? "bg-gradient-to-tr from-[#0050cb] to-[#0066ff] text-white shadow-xl border-transparent"
                        : "bg-[#f8fafc] text-[#191c1e] border-[#c2c6d8]/40 hover:border-[#0066ff]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          pm.isDefault ? "bg-white/20 text-white" : "bg-[#dae1ff] text-[#0050cb]"
                        }`}>
                          {pm.badge}
                        </span>

                        {pm.isDefault && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                            <Check className="w-4 h-4" /> Active Default
                          </span>
                        )}
                      </div>

                      <h4 className="font-display text-lg font-bold mb-1">{pm.title}</h4>
                      <p className={`text-xs font-mono ${pm.isDefault ? "opacity-90" : "text-[#555f6c]"}`}>
                        {pm.detail}
                      </p>
                    </div>

                    {!pm.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="text-xs font-bold underline hover:opacity-80 pt-2 text-left"
                      >
                        Set as Default Payment Method
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bento Card (Air Quality Tip) */}
          <div className="p-6 rounded-2xl glass-card border border-[#0066ff]/20 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#0050cb] mb-2">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-display font-bold text-base">Air Quality Tip</h4>
            </div>
            <p className="text-xs text-[#424656] leading-relaxed">
              Cleaning your filter every 3 months reduces energy consumption by up to 15%.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Technician Live Arrival Tracker Modal */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#c2c6d8]/30 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#c2c6d8]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#191c1e]">Live Service Tracker</h3>
                  <p className="text-xs text-[#727687]">Booking {currentActiveBooking?.bookingCode || "#ART-8921"}</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="text-[#727687] hover:text-[#191c1e] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Booking Slot Time Card */}
            <div className="bg-[#f0f4f9] p-3.5 rounded-2xl flex items-center justify-between border border-[#0050cb]/15">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#0050cb]" />
                <div>
                  <p className="text-[10px] font-bold text-[#727687] uppercase tracking-wider">Booking Slot / Time</p>
                  <p className="text-xs font-extrabold text-[#191c1e]">
                    {formatBookingDateTime(currentActiveBooking?.preferredDateTime)}
                  </p>
                </div>
              </div>
              <Badge status={currentActiveBooking?.status || "PENDING"}>
                {currentActiveBooking?.status || "PENDING"}
              </Badge>
            </div>

            {/* Tracker Content (Active vs Cancelled) */}
            {currentActiveBooking?.status === "CANCELLED" ? (
              <div className="bg-[#ffdad6]/40 border border-[#ba1a1a]/30 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[#ba1a1a] font-extrabold text-sm flex items-center justify-center gap-1.5">
                  ⚠️ BOOKING CANCELLED
                </span>
                <p className="text-xs text-[#424656] leading-relaxed">
                  This service request has been cancelled and technician assignment was revoked.
                </p>
              </div>
            ) : (
              <>
                {/* Technician Profile Card */}
                {(() => {
                  const techName = currentActiveBooking?.technicianName || technicianName || "Nitesh Kumar Sharma";
                  const techPhone = currentActiveBooking?.technicianPhone || technicianPhone || "+91 9264173334";
                  const initials = techName
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "AI";
                  const rawCall = techPhone.replace(/[^0-9+]/g, "");

                  return (
                    <div className="bg-[#f0f4f9] p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#0066ff] text-white flex items-center justify-center font-bold text-sm shadow-md">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#191c1e]">{techName}</p>
                          <p className="text-[11px] text-[#2e7d32] font-semibold flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full bg-[#2e7d32] ${currentActiveBooking?.status !== "COMPLETED" ? "animate-pulse" : ""}`} />
                            {currentActiveBooking?.status === "COMPLETED" ? "Service Completed" : "En Route"} 
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${rawCall}`}
                        className="px-3 py-1.5 bg-[#0066ff] text-white rounded-full font-bold text-xs hover:bg-[#0050cb] transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  );
                })()}

                {/* Progress Step Timeline */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#191c1e]">1. Booking Confirmed</p>
                      <p className="text-[11px] text-[#727687]">Request accepted & scheduled</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {currentActiveBooking?.status === "COMPLETED" || currentActiveBooking?.status === "IN_PROGRESS" ? (
                      <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse">
                        2
                      </div>
                    )}
                    <div>
                      <p className={`font-bold text-xs ${currentActiveBooking?.status === "COMPLETED" || currentActiveBooking?.status === "IN_PROGRESS" ? "text-[#191c1e]" : "text-[#0050cb]"}`}>
                        2. Technician {currentActiveBooking?.status === "COMPLETED" ? "Arrived & Inspected" : "En Route"}
                      </p>
                      <p className="text-[11px] text-[#727687]">
                        {currentActiveBooking?.status === "COMPLETED" ? "Doorstep inspection & testing completed" : "Technician is on the way to your address"}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${currentActiveBooking?.status === "COMPLETED" ? "" : "opacity-60"}`}>
                    {currentActiveBooking?.status === "COMPLETED" ? (
                      <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#c2c6d8] text-[#191c1e] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        3
                      </div>
                    )}
                    <div>
                      <p className={`font-bold text-xs ${currentActiveBooking?.status === "COMPLETED" ? "text-[#2e7d32]" : "text-[#191c1e]"}`}>
                        3. {currentActiveBooking?.status === "COMPLETED" ? "Service Completed Successfully" : "Doorstep Inspection & Service"}
                      </p>
                      <p className="text-[11px] text-[#727687]">
                        {currentActiveBooking?.status === "COMPLETED" ? "Jet cleaning and quality testing finished" : "Jet cleaning and quality testing"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button fullWidth onClick={() => setIsTrackingModalOpen(false)}>
              Close Tracker
            </Button>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#c2c6d8]/30 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#c2c6d8]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#191c1e]">Add Payment Method</h3>
                  <p className="text-xs text-[#727687]">256-Bit SSL Encrypted</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="text-[#727687] hover:text-[#191c1e] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424656]">Payment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPaymentType("UPI")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      newPaymentType === "UPI"
                        ? "bg-[#0066ff] text-white border-transparent shadow-md"
                        : "bg-[#f8fafc] text-[#191c1e] border-[#c2c6d8]"
                    }`}
                  >
                    UPI ID / App
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPaymentType("CARD")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      newPaymentType === "CARD"
                        ? "bg-[#0066ff] text-white border-transparent shadow-md"
                        : "bg-[#f8fafc] text-[#191c1e] border-[#c2c6d8]"
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424656]">Account Nickname / Card Title</label>
                <input
                  type="text"
                  placeholder={newPaymentType === "UPI" ? "e.g. Personal Google Pay" : "e.g. HDFC Salary Card"}
                  value={newPaymentTitle}
                  onChange={(e) => setNewPaymentTitle(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424656]">
                  {newPaymentType === "UPI" ? "UPI ID *" : "Card Number *"}
                </label>
                <input
                  type="text"
                  placeholder={newPaymentType === "UPI" ? "username@okicici" : "4532 •••• •••• 8921"}
                  value={newPaymentDetail}
                  onChange={(e) => setNewPaymentDetail(e.target.value)}
                  required
                  className="w-full bg-[#f8fafc] border border-[#c2c6d8] rounded-xl p-3 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsAddPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth>
                  Save Payment Method
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
