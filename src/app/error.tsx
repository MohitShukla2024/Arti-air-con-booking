"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log full error details server-side / console for observability
    console.error("[GLOBAL_UI_ERROR_BOUNDARY]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 text-[#191c1e]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#c2c6d8]/30 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-[#424656] leading-relaxed">
            We experienced an unexpected issue loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#0050cb] hover:bg-[#003da1] text-white font-bold rounded-full px-6 py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-[#191c1e] font-bold rounded-full px-6 py-2.5 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
