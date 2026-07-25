"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Bell, ExternalLink } from "lucide-react";
import { getFcmToken, onForegroundMessage } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/use-auth-store";
import { useNotificationStore } from "@/store/use-notification-store";

export function NotificationListener() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const currentTokenRef = useRef<string | null>(null);

  // Sync token whenever authentication status or user changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      getFcmToken().then(async (token) => {
        if (token && token !== currentTokenRef.current) {
          currentTokenRef.current = token;
          try {
            await fetch("/api/notifications/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fcmToken: token, deviceType: "web" }),
            });
          } catch (error) {
            console.error("[Notification Listener] Token registration error:", error);
          }
        }
      });
    }
  }, [isAuthenticated, user]);

  // Subscribe to real-time foreground messages
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || "Arti Air Con Update";
      const body = payload.notification?.body || payload.data?.body || "You have a new update regarding your booking.";
      const targetUrl = payload.data?.url || (user?.role === "ADMIN" ? "/admin/bookings" : "/dashboard");

      // Store notification in Zustand persistent store
      useNotificationStore.getState().addNotification({
        title,
        body,
        url: targetUrl,
        bookingId: payload.data?.bookingId,
      });

      // Custom real-time toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } pointer-events-auto flex w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 transition-all`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <Bell className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  if (targetUrl) router.push(targetUrl);
                }}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
              >
                View <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router, user?.role]);

  return null;
}
