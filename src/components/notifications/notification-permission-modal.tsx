"use client";

import React, { useEffect, useState } from "react";
import { Bell, X, ShieldCheck } from "lucide-react";
import { requestBrowserPermission, getFcmToken } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/use-auth-store";
import toast from "react-hot-toast";

const DISMISS_KEY = "arti_fcm_permission_dismissed";
const DISMISS_DURATION_DAYS = 7;

export function NotificationPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Do not show modal if user already granted or denied browser permissions
    if (Notification.permission !== "default") {
      return;
    }

    // Check if user recently clicked "Not Now"
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTimestamp = parseInt(dismissedAt, 10);
      const daysSinceDismissed = (Date.now() - dismissedTimestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    // Show modal after 1 second
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const permission = await requestBrowserPermission();
      if (permission === "granted") {
        const token = await getFcmToken();
        if (token && isAuthenticated) {
          try {
            await fetch("/api/notifications/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fcmToken: token, deviceType: "web" }),
            });
          } catch (err) {
            console.error("[FCM Modal] Error registering token with backend:", err);
          }
        }
        toast.success("Notifications enabled! You'll receive instant booking updates.", {
          icon: "🔔",
        });
      } else {
        toast.error("Notification permission was not granted.");
      }
    } catch (error) {
      console.error("[FCM Modal] Error allowing notifications:", error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleNotNow = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <button
          onClick={handleNotNow}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Instant Updates
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enable Notifications</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Allow notifications to receive instant booking updates, technician arrival status, and service alerts right on your device.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleNotNow}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleAllow}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Enabling..." : "Allow Notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
