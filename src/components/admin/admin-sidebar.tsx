"use client";

import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Snowflake,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";
import { BRAND_INFO } from "@/lib/constants";

export type AdminTabType = "dashboard" | "bookings" | "customers" | "settings";

const ADMIN_NAV_ITEMS: { name: string; id: AdminTabType; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Bookings", id: "bookings", icon: CalendarCheck },
  { name: "Customers", id: "customers", icon: Users },
  { name: "Settings", id: "settings", icon: Settings },
];

interface AdminSidebarProps {
  activeTab?: AdminTabType;
  onSelectTab?: (tab: AdminTabType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  activeTab = "dashboard",
  onSelectTab,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const router = useRouter();
  const { logoutAdmin } = useAuthStore();

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Admin logged out successfully");
    router.replace("/admin/login");
  };

  const handleNavClick = (tabId: AdminTabType) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#c2c6d8]/20 flex flex-col justify-between p-6 shrink-0 min-h-screen transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => handleNavClick("dashboard")}
            className="flex items-center gap-3 px-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#0066ff] rounded-xl flex items-center justify-center text-white shadow-md">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-[#191c1e] block leading-none">
                {BRAND_INFO.name}
              </span>
              <span className="text-xs text-[#727687] font-medium block mt-0.5">
                Service Management
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#0066ff] text-white shadow-md"
                    : "text-[#555f6c] hover:bg-[#f2f4f6] hover:text-[#191c1e]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-6 border-t border-[#c2c6d8]/20">
        <button
          onClick={() => handleNavClick("settings")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#555f6c] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-[#727687]" />
          <span>Help Support</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors"
        >
          <LogOut className="w-5 h-5 text-[#ba1a1a]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
