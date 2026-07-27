"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home, Phone } from "lucide-react";
import { BRAND_INFO } from "@/lib/constants";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60 space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-blue-50 text-[#0066ff] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <WifiOff className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider">
            {BRAND_INFO.name} Offline Mode
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            You are Offline
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            It looks like you lost your internet connection. Please check your network or Wi-Fi settings to manage your bookings.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleReload}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#0066ff] hover:bg-[#0050cb] text-white font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>

          <Link
            href="/"
            className="w-full py-3 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Phone className="w-3.5 h-3.5 text-[#0066ff]" />
          <span>Emergency Support: <strong>+91 9264173334</strong></span>
        </div>
      </div>
    </div>
  );
}
