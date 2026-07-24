"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu, Search, Bell } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#191c1e] antialiased">
      {/* Fixed Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 sm:px-8 bg-[#f7f9fb]/80 backdrop-blur-xl h-16 sm:h-20 border-b border-[#c2c6d8]/20">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-[#191c1e] hover:bg-[#e0e3e5] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#0050cb]">
              Dashboard Overview
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-[#eceef0] rounded-full px-4 py-2 border border-[#c2c6d8]/30">
              <Search className="w-4 h-4 text-[#424656] mr-2" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="bg-transparent border-none focus:outline-none text-sm w-48 text-[#191c1e]"
              />
            </div>

            {/* Notifications & Profile Avatar */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                className="text-[#555f6c] hover:text-[#0050cb] p-2 transition-colors relative min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
              </button>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-[#0066ff] relative shrink-0">
                <Image
                  src={
                    user?.avatarUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuD_QcmYj1m5UYX4BVtzKGT4v4ZqprW4GrOSyP7T9aC9pcRdG89j_v7AGPWsA4jS9RcLB4IzwicCmR2c_-2ZXmAH_OlbkVnCIyUdtDkRYkHiHIK1DjBViYiwRO7GsYh1zERs8HZhXjYf1OjbcV-OHQ50OVUIbRtzFCB2DznqTsZ5XKuG5GqnK-OSFaSbqaXtT1eW0In48WexdVJuMstQdo1pnRwZCEXJ4zoVAburPiBtIfoSaNCFoqXa"
                  }
                  alt="Admin Avatar"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto w-full">{children}</main>

        {/* Admin Footer */}
        <footer className="w-full py-8 px-8 flex flex-col items-center text-center gap-4 border-t border-[#c2c6d8]/30 mt-auto">
          <div className="font-display text-lg font-bold text-[#0050cb]">
            Arti Air Con
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#424656]">
            <a href="#" className="hover:text-[#0050cb] transition-colors">
              System Logs
            </a>
            <a href="#" className="hover:text-[#0050cb] transition-colors">
              API Docs
            </a>
            <a href="#" className="hover:text-[#0050cb] transition-colors">
              Technician Portal
            </a>
            <a href="#" className="hover:text-[#0050cb] transition-colors">
              Support Center
            </a>
          </div>
          <p className="text-xs text-[#424656]/60">
            © {new Date().getFullYear()} Arti Air Con. All Rights Reserved. Dashboard v2.4.1
          </p>
        </footer>
      </div>
    </div>
  );
}
