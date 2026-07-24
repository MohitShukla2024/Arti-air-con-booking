"use client";

import { useRouter } from "next/navigation";
import { Phone, MessageSquare, CalendarPlus } from "lucide-react";
import { useSettingsStore } from "@/store/use-settings-store";
import { useAuthStore } from "@/store/use-auth-store";

export function MobileBottomNav() {
  const { phone } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Strip formatting for tel: and wa.me: links
  const phoneRaw = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");

  const handleBookNav = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/book");
    } else {
      router.push("/book");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:hidden bg-[#f7f9fb]/90 backdrop-blur-xl border-t border-[#c2c6d8]/50 shadow-[0_-4px_20px_rgba(0,102,255,0.1)]">
      <a
        href={`tel:+${phoneRaw}`}
        className="flex flex-col items-center justify-center text-[#5b6572] hover:text-[#0050cb] active:scale-95 transition-all min-w-[56px] min-h-[44px]"
      >
        <Phone className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Call</span>
      </a>

      <button
        onClick={handleBookNav}
        className="flex flex-col items-center justify-center bg-[#0066ff] text-white rounded-full p-3.5 -translate-y-4 shadow-xl active:scale-95 transition-transform min-w-[52px] min-h-[52px]"
        aria-label="Book Service Now"
      >
        <CalendarPlus className="w-6 h-6" />
      </button>

      <a
        href={`https://wa.me/${phoneRaw}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center text-[#5b6572] hover:text-[#0050cb] active:scale-95 transition-all min-w-[56px] min-h-[44px]"
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
      </a>
    </nav>
  );
}
