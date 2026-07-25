"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  ClipboardList,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Search,
  Bell,
  Check,
  X,
  Eye,
  CheckCheck,
  User,
  Phone,
  Calendar,
  Wrench,
  Building,
  RefreshCw,
  CalendarPlus,
  Users,
  Save,
  DollarSign,
  Lock,
  Download,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth-store";
import { useSettingsStore } from "@/store/use-settings-store";
import { useNotificationStore } from "@/store/use-notification-store";
import { NotificationBellDropdown } from "@/components/notifications/notification-bell-dropdown";
import { AdminSidebar, AdminTabType } from "@/components/admin/admin-sidebar";

interface AdminBookingRow {
  id: string;
  bookingCode: string;
  customerName: string;
  initials: string;
  phone: string;
  serviceType: string;
  acType?: string;
  acBrand?: string;
  fullAddress?: string;
  date: string;
  preferredDateTime?: string;
  status: "PENDING" | "ACCEPTED" | "EN_ROUTE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  technicianAssigned?: string;
}

function formatBookingDateTime(dateStr?: string) {
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

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isAdmin, isHydrated } = useAuthStore();
  const settingsStore = useSettingsStore();

  // ROUTE GUARD: Redirect unauthenticated users
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !isAdmin || user?.role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isAdmin, isHydrated, router, user?.role]);

  // Tab State: "dashboard" | "bookings" | "customers" | "settings" derived directly from URL searchParams
  const rawTabParam = searchParams.get("tab") as AdminTabType;
  const activeTab: AdminTabType =
    rawTabParam && ["dashboard", "bookings", "customers", "settings"].includes(rawTabParam)
      ? rawTabParam
      : "dashboard";

  const setActiveTab = (tab: AdminTabType) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState(null, "", newUrl.toString());
  };

  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<AdminBookingRow | null>(null);
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // System Settings State
  const [companySettings, setCompanySettings] = useState({
    brandName: settingsStore.brandName,
    emergencyPhone: settingsStore.emergencyPhone,
    supportEmail: settingsStore.supportEmail,
    address: settingsStore.address,
    workingHours: settingsStore.workingHours,
    baseServiceFee: settingsStore.baseServiceFee,
    gasRefillFee: settingsStore.gasRefillFee,
    emergencyFee: settingsStore.emergencyFee,
    smsNotifications: settingsStore.smsNotifications,
    emailAlerts: settingsStore.emailAlerts,
    autoAssignTechnicians: false,
    adminPasscode: settingsStore.adminPasscode,
    sessionTimeoutMins: settingsStore.sessionTimeoutMins,
  });

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setCompanySettings((prev) => ({
        ...prev,
        brandName: settingsStore.brandName,
        emergencyPhone: settingsStore.emergencyPhone,
        supportEmail: settingsStore.supportEmail,
        address: settingsStore.address,
        workingHours: settingsStore.workingHours,
        baseServiceFee: settingsStore.baseServiceFee,
        gasRefillFee: settingsStore.gasRefillFee,
        emergencyFee: settingsStore.emergencyFee,
        smsNotifications: settingsStore.smsNotifications,
        emailAlerts: settingsStore.emailAlerts,
        autoAssignTechnicians: settingsStore.autoAssignTechnicians,
        sessionTimeoutMins: settingsStore.sessionTimeoutMins,
      }));
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [
    settingsStore.address,
    settingsStore.baseServiceFee,
    settingsStore.brandName,
    settingsStore.emailAlerts,
    settingsStore.emergencyFee,
    settingsStore.emergencyPhone,
    settingsStore.gasRefillFee,
    settingsStore.smsNotifications,
    settingsStore.supportEmail,
    settingsStore.autoAssignTechnicians,
    settingsStore.sessionTimeoutMins,
    settingsStore.workingHours,
  ]);

  // Fetch Live Bookings from API (Pure Dynamic Data)
  const fetchLiveBookings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        type BookingApiRow = {
          id: string;
          bookingCode?: string;
          fullName?: string;
          customerName?: string;
          mobileNumber?: string;
          phone?: string;
          serviceType?: string;
          acType?: string;
          acBrand?: string;
          fullAddress?: string;
          city?: string;
          preferredDateTime?: string;
          status?: AdminBookingRow["status"];
        };

        const mapped: AdminBookingRow[] = data.history.map((b: BookingApiRow) => {
          const name = b.fullName || b.customerName || "Customer";
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return {
            id: b.id,
            bookingCode: b.bookingCode || `#ART-${b.id}`,
            customerName: name,
            initials: initials || "CU",
            phone: b.mobileNumber || b.phone || "+91 99999 99999",
            serviceType: b.serviceType || "AC Service",
            acType: b.acType || "Split AC",
            acBrand: b.acBrand || "Daikin",
            fullAddress: b.fullAddress || b.city || "Aaya Nagar, Sunday Market Road, H Block, Phase-6, Bandh Road-Market",
            date: formatBookingDateTime(b.preferredDateTime),
            preferredDateTime: b.preferredDateTime,
            status: b.status || "PENDING",
            technicianAssigned: b.status === "ACCEPTED" ? "Nitesh Kumar Sharma" : undefined,
          };
        });
        setBookings(mapped);
      }
    } catch (e) {
      console.error("Error fetching admin bookings:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void fetchLiveBookings();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [fetchLiveBookings]);

  // Action Handlers
  const handleAccept = async (id: string, code: string) => {
    try {
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
    } catch {}

    // Notification targeted strictly for CUSTOMER (Status Update)
    useNotificationStore.getState().addNotification({
      title: "Booking Confirmed! 🚀",
      body: `Your booking ${code} has been ACCEPTED. Technician Nitesh Kumar Sharma has been assigned to your address.`,
      url: "/dashboard",
      bookingId: id,
      role: "CUSTOMER",
    });

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "ACCEPTED" as const, technicianAssigned: "Nitesh Kumar Sharma" } : b))
    );
    toast.success(`Booking ${code} accepted & assigned to Technician Nitesh Kumar Sharma.`);
  };

  const handleReject = async (id: string, code: string) => {
    try {
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
    } catch {}

    // Notification targeted strictly for CUSTOMER
    useNotificationStore.getState().addNotification({
      title: "Booking Cancelled ❌",
      body: `Your booking ${code} could not be accepted and was cancelled.`,
      url: "/dashboard",
      bookingId: id,
      role: "CUSTOMER",
    });

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as const } : b))
    );
    toast.error(`Booking ${code} rejected.`);
  };

  const handleComplete = async (id: string, code: string) => {
    try {
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
    } catch {}

    // Notification targeted strictly for CUSTOMER
    useNotificationStore.getState().addNotification({
      title: "Booking Completed ✅",
      body: `Your AC service for booking ${code} has been marked COMPLETED. Thank you for choosing Arti Air Con!`,
      url: "/dashboard",
      bookingId: id,
      role: "CUSTOMER",
    });

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "COMPLETED" as const } : b))
    );
    toast.success(`Booking ${code} marked as COMPLETED!`);
  };

  const exportBookingsToCSV = () => {
    if (bookings.length === 0) {
      toast.error("No bookings available to export.");
      return;
    }
    const headers = ["ID", "Booking Code", "Customer Name", "Phone", "Service Type", "AC Type", "Address", "Date", "Status"];
    const rows = bookings.map((b) => [
      b.id,
      b.bookingCode,
      `"${b.customerName.replace(/"/g, '""')}"`,
      b.phone,
      b.serviceType,
      b.acType || "",
      `"${(b.fullAddress || "").replace(/"/g, '""')}"`,
      b.date,
      b.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `arti_air_con_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings exported to CSV file!");
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaveState("saving");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companySettings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Unable to save settings.");
      }

      settingsStore.updateSettings(data.settings);
      setCompanySettings((prev) => ({
        ...prev,
        ...data.settings,
        adminPasscode: prev.adminPasscode,
      }));
      setSettingsSaveState("saved");
      toast.success("System configurations saved permanently across the website!");

      window.setTimeout(() => {
        setSettingsSaveState("idle");
      }, 2500);
    } catch (error) {
      setSettingsSaveState("idle");
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    }
  };

  // 100% Dynamic Metrics
  const totalOrders = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  // Filtered list by search & status
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Unique Customer list derived from live bookings
  const customerList = Array.from(
    new Map(bookings.map((b) => [b.phone, b])).values()
  );

  // Status Badge Renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff8e1] text-[#b78103]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b78103] animate-pulse" />
            Pending
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e3f2fd] text-[#1976d2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1976d2]" />
            Accepted
          </span>
        );
      case "EN_ROUTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f3e5f5] text-[#7b1fa2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7b1fa2] animate-pulse" />
            En Route
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8eaf6] text-[#3949ab]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3949ab] animate-pulse" />
            In Progress
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ffebee] text-[#c62828]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c62828]" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f2f4f6] text-[#555f6c]">
            {status}
          </span>
        );
    }
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#191c1e] antialiased flex relative">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile backdrop shadow layer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto space-y-6 md:space-y-8 max-w-[1400px]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-[#0050cb] hover:bg-blue-50 border border-blue-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#0050cb] capitalize">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "bookings" && "Bookings Management"}
              {activeTab === "customers" && "Customer Directory & CRM"}
              {activeTab === "settings" && "System Settings & Configuration"}
            </h1>
            <button
              onClick={fetchLiveBookings}
              disabled={isRefreshing}
              className="text-[#727687] hover:text-[#0050cb] transition-colors p-1"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727687]" />
              <input
                type="text"
                placeholder="Search ID, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f0f4f9] border border-transparent rounded-full text-xs text-[#191c1e] placeholder:text-[#727687] focus:outline-none focus:bg-white focus:border-[#0050cb] transition-all"
              />
            </div>

            {/* Notification Bell */}
            <NotificationBellDropdown variant="light" />

            {/* User Profile Avatar (Icon Badge - No Profile Image) */}
            <div className="w-9 h-9 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW VIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* 5 Top Stat Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {/* TOTAL ORDERS */}
              <div className="bg-white p-5 rounded-2xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-[#0066ff] text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#727687] uppercase tracking-wider block mb-1">
                    TOTAL ORDERS
                  </span>
                  <div className="font-display text-2xl font-bold text-[#191c1e]">
                    {totalOrders}
                  </div>
                  <span className="text-[11px] font-bold text-[#2e7d32] flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3 inline" /> Live Count
                  </span>
                </div>
              </div>

              {/* PENDING */}
              <div className="bg-white p-5 rounded-2xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 text-[#f97316] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#727687] uppercase tracking-wider block mb-1">
                    PENDING
                  </span>
                  <div className="font-display text-2xl font-bold text-[#191c1e]">
                    {pendingCount}
                  </div>
                  <span className="text-[11px] text-[#727687] block mt-1">
                    Awaiting response
                  </span>
                </div>
              </div>

              {/* ACCEPTED */}
              <div className="bg-white p-5 rounded-2xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-full bg-[#0066ff] text-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#727687] uppercase tracking-wider block mb-1">
                    ACCEPTED
                  </span>
                  <div className="font-display text-2xl font-bold text-[#191c1e]">
                    {acceptedCount}
                  </div>
                  <span className="text-[11px] text-[#727687] block mt-1">
                    Scheduled for service
                  </span>
                </div>
              </div>

              {/* COMPLETED */}
              <div className="bg-white p-5 rounded-2xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-full bg-[#2e7d32] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#727687] uppercase tracking-wider block mb-1">
                    COMPLETED
                  </span>
                  <div className="font-display text-2xl font-bold text-[#191c1e]">
                    {completedCount}
                  </div>
                  <span className="text-[11px] text-[#727687] block mt-1">
                    Service finalized
                  </span>
                </div>
              </div>

              {/* CANCELLED */}
              <div className="bg-white p-5 rounded-2xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-full bg-[#c62828] text-white flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#727687] uppercase tracking-wider block mb-1">
                    CANCELLED
                  </span>
                  <div className="font-display text-2xl font-bold text-[#191c1e]">
                    {cancelledCount}
                  </div>
                  <span className="text-[11px] text-[#727687] block mt-1">
                    Live count
                  </span>
                </div>
              </div>
            </section>

            {/* Bookings Summary Table */}
            <section className="bg-white rounded-3xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] overflow-hidden">
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-[#c2c6d8]/10">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#191c1e]">
                    Latest Bookings
                  </h2>
                  <p className="text-xs text-[#727687]">
                    Real-time status of service requests
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] text-[11px] font-bold text-[#727687] uppercase tracking-wider border-b border-[#c2c6d8]/15">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c2c6d8]/10 text-xs text-[#191c1e]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-[#424656]">
                          <div className="max-w-sm mx-auto space-y-3">
                            <CalendarPlus className="w-12 h-12 text-[#0066ff]/30 mx-auto" />
                            <p className="font-bold text-[#191c1e] text-base">
                              No service bookings received yet
                            </p>
                            <p className="text-xs text-[#727687]">
                              When customers submit service requests via <Link href="/book" className="text-[#0066ff] underline font-semibold">/book</Link>, they will appear here live in real-time.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((row) => (
                        <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="px-6 py-4 font-bold text-[#0050cb]">
                            {row.bookingCode}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#d9e3f2] flex items-center justify-center text-[10px] font-bold text-[#555f6c]">
                                {row.initials}
                              </div>
                              <span className="font-semibold text-[#191c1e]">
                                {row.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#555f6c]">{row.phone}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-[#f0f4f9] text-[#555f6c] rounded-md font-semibold text-[11px]">
                              {row.serviceType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#555f6c]">{row.date}</td>
                          <td className="px-6 py-4">{renderStatusBadge(row.status)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {row.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleAccept(row.id, row.bookingCode)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded-md"
                                    title="Accept"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(row.id, row.bookingCode)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {row.status === "ACCEPTED" && (
                                <button
                                  onClick={() => handleComplete(row.id, row.bookingCode)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded-md"
                                  title="Complete"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedBookingDetails(row)}
                                className="p-1 text-[#727687] hover:bg-gray-100 rounded-md"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT VIEW */}
        {activeTab === "bookings" && (
          <section className="bg-white rounded-3xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c2c6d8]/10">
              <div>
                <h2 className="font-display text-lg font-bold text-[#191c1e]">
                  Full Bookings Directory
                </h2>
                <p className="text-xs text-[#727687]">
                  Filter & manage all incoming customer requests
                </p>
              </div>

              {/* Filter & Export Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[#555f6c]">Filter:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-[#f0f4f9] border border-[#c2c6d8]/30 rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none"
                  >
                    <option value="ALL">All Statuses ({totalOrders})</option>
                    <option value="PENDING">Pending ({pendingCount})</option>
                    <option value="ACCEPTED">Accepted ({acceptedCount})</option>
                    <option value="COMPLETED">Completed ({completedCount})</option>
                    <option value="CANCELLED">Cancelled ({cancelledCount})</option>
                  </select>
                </div>

                <button
                  onClick={exportBookingsToCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066ff] text-white rounded-xl font-bold text-xs hover:bg-[#0050cb] transition-colors shadow-sm"
                  title="Export Bookings to CSV File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[11px] font-bold text-[#727687] uppercase tracking-wider border-b border-[#c2c6d8]/15">
                    <th className="px-6 py-4">Booking Code</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Mobile Number</th>
                    <th className="px-6 py-4">Service Type</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c2c6d8]/10 text-xs text-[#191c1e]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-[#424656]">
                        <p className="font-bold text-base text-[#191c1e] mb-1">
                          No matching bookings found
                        </p>
                        <p className="text-xs text-[#727687]">
                          Try clearing the search query or status filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#0050cb]">{row.bookingCode}</td>
                        <td className="px-6 py-4 font-semibold">{row.customerName}</td>
                        <td className="px-6 py-4 text-[#555f6c]">{row.phone}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-[#f0f4f9] text-[#555f6c] rounded-md font-semibold text-[11px]">
                            {row.serviceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#555f6c]">{row.date}</td>
                        <td className="px-6 py-4">{renderStatusBadge(row.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {row.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleAccept(row.id, row.bookingCode)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                                  title="Accept & Dispatch"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(row.id, row.bookingCode)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {row.status === "ACCEPTED" && (
                              <button
                                onClick={() => handleComplete(row.id, row.bookingCode)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                                title="Mark Completed"
                              >
                                <CheckCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBookingDetails(row)}
                              className="p-1.5 text-[#727687] hover:bg-gray-100 rounded-md"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: CUSTOMERS DIRECTORY & CRM VIEW */}
        {activeTab === "customers" && (
          <section className="bg-white rounded-3xl border border-[#c2c6d8]/20 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[#c2c6d8]/10">
              <h2 className="font-display text-lg font-bold text-[#191c1e]">
                Registered Customer Directory
              </h2>
              <p className="text-xs text-[#727687]">
                Live customer contacts & service history logs
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[11px] font-bold text-[#727687] uppercase tracking-wider border-b border-[#c2c6d8]/15">
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Mobile Number</th>
                    <th className="px-6 py-4">Total Bookings</th>
                    <th className="px-6 py-4">Membership Tier</th>
                    <th className="px-6 py-4">Last Service</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c2c6d8]/10 text-xs text-[#191c1e]">
                  {customerList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-[#424656]">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Users className="w-12 h-12 text-[#0066ff]/30 mx-auto" />
                          <p className="font-bold text-base text-[#191c1e]">
                            No registered customer records yet
                          </p>
                          <p className="text-xs text-[#727687]">
                            Customer records are generated automatically when bookings are placed.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customerList.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#191c1e]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0066ff]/10 text-[#0050cb] flex items-center justify-center font-bold">
                              {cust.initials}
                            </div>
                            <span>{cust.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#555f6c]">{cust.phone}</td>
                        <td className="px-6 py-4 font-bold text-[#0050cb]">
                          {bookings.filter((b) => b.phone === cust.phone).length} Request(s)
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                            Verified Client
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#555f6c]">{cust.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toast(`Contacting ${cust.customerName} at ${cust.phone}`)}
                            className="px-3 py-1 bg-[#0066ff] text-white rounded-full font-bold text-[11px] hover:bg-[#0050cb]"
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: SYSTEM SETTINGS & CONFIGURATION VIEW */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* 1. Company Profile Settings */}
            <div className="bg-white rounded-3xl border border-[#c2c6d8]/20 p-8 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] space-y-6">
              <div className="flex items-center gap-3 border-b border-[#c2c6d8]/20 pb-4">
                <div className="p-2.5 rounded-xl bg-[#0066ff]/10 text-[#0050cb]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#191c1e]">
                    Company & Brand Settings
                  </h3>
                  <p className="text-xs text-[#727687]">
                    Manage business details, support hotline, and address info.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={companySettings.brandName}
                    onChange={(e) => setCompanySettings({ ...companySettings, brandName: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-semibold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Emergency Support Hotline
                  </label>
                  <input
                    type="text"
                    value={companySettings.emergencyPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, emergencyPhone: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-semibold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    value={companySettings.supportEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportEmail: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-semibold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Operational Working Hours
                  </label>
                  <input
                    type="text"
                    value={companySettings.workingHours}
                    onChange={(e) => setCompanySettings({ ...companySettings, workingHours: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-semibold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Service Pricing & Rates */}
            <div className="bg-white rounded-3xl border border-[#c2c6d8]/20 p-8 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] space-y-6">
              <div className="flex items-center gap-3 border-b border-[#c2c6d8]/20 pb-4">
                <div className="p-2.5 rounded-xl bg-[#0066ff]/10 text-[#0050cb]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#191c1e]">
                    Service Rates & Pricing Configuration
                  </h3>
                  <p className="text-xs text-[#727687]">
                    Set default service rates and emergency fees.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Base AC Service Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={companySettings.baseServiceFee}
                    onChange={(e) => setCompanySettings({ ...companySettings, baseServiceFee: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-bold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Gas Refill Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={companySettings.gasRefillFee}
                    onChange={(e) => setCompanySettings({ ...companySettings, gasRefillFee: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-bold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Emergency Express Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={companySettings.emergencyFee}
                    onChange={(e) => setCompanySettings({ ...companySettings, emergencyFee: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-bold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Security & Passcode Configuration */}
            <div className="bg-white rounded-3xl border border-[#c2c6d8]/20 p-8 shadow-[0px_4px_20px_rgba(0,102,255,0.03)] space-y-6">
              <div className="flex items-center gap-3 border-b border-[#c2c6d8]/20 pb-4">
                <div className="p-2.5 rounded-xl bg-[#0066ff]/10 text-[#0050cb]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#191c1e]">
                    Security & Admin Gateway Access
                  </h3>
                  <p className="text-xs text-[#727687]">
                    Manage admin security codes and session duration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Admin Gateway Master Passcode
                  </label>
                  <input
                    type="password"
                    value={companySettings.adminPasscode}
                    onChange={(e) => setCompanySettings({ ...companySettings, adminPasscode: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-bold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555f6c] uppercase mb-2">
                    Session Auto-Lock (Minutes)
                  </label>
                  <input
                    type="number"
                    value={companySettings.sessionTimeoutMins}
                    onChange={(e) => setCompanySettings({ ...companySettings, sessionTimeoutMins: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#c2c6d8]/40 rounded-xl p-3.5 text-xs text-[#191c1e] font-bold focus:outline-none focus:border-[#0050cb]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={settingsSaveState === "saving"}
                className="bg-[#0066ff] hover:bg-[#0050cb] text-white px-8 py-3.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {settingsSaveState === "saving"
                  ? "Saving..."
                  : settingsSaveState === "saved"
                    ? "Saved permanently"
                    : "Save System Configurations"}
              </button>
            </div>
          </form>
        )}

        {/* BOOKING DETAILS MODAL */}
        {selectedBookingDetails && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-[#c2c6d8]/20">
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#0066ff]/10 text-[#0050cb] flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#191c1e]">
                    Booking {selectedBookingDetails.bookingCode}
                  </h3>
                  {renderStatusBadge(selectedBookingDetails.status)}
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#191c1e] bg-[#f8fafc] p-5 rounded-2xl border border-[#c2c6d8]/15 mb-5">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#0050cb]" />
                  <span className="font-semibold text-[#727687]">Customer:</span>{" "}
                  {selectedBookingDetails.customerName}
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#0050cb]" />
                  <span className="font-semibold text-[#727687]">Phone:</span>{" "}
                  {selectedBookingDetails.phone}
                </div>
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-[#0050cb]" />
                  <span className="font-semibold text-[#727687]">Address:</span>{" "}
                  {selectedBookingDetails.fullAddress || "Gurgaon"}
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0050cb]" />
                  <span className="font-semibold text-[#727687]">Booking Slot / Time:</span>{" "}
                  <span className="font-extrabold text-[#0050cb]">
                    {formatBookingDateTime(selectedBookingDetails.preferredDateTime || selectedBookingDetails.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-[#0050cb]" />
                  <span className="font-semibold text-[#727687]">Unit:</span>{" "}
                  {selectedBookingDetails.acBrand || "Daikin"}{" "}
                  {selectedBookingDetails.acType || "Split AC"} ({selectedBookingDetails.serviceType})
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="px-5 py-2 rounded-full border border-[#c2c6d8] text-xs font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
