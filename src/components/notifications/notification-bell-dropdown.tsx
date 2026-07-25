"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2, Calendar, ExternalLink, X } from "lucide-react";
import { useNotificationStore, AppNotification } from "@/store/use-notification-store";
import { useAuthStore } from "@/store/use-auth-store";
import { requestBrowserPermission, getFcmToken } from "@/lib/firebase/client";
import toast from "react-hot-toast";

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

export function NotificationBellDropdown({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("granted");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const currentUserRole = user?.role || "CUSTOMER";
  const userNotifications = notifications.filter((n) => {
    if (!n.role || n.role === "ALL") return true;
    return n.role === currentUserRole;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Sync notifications from server API (/api/notifications)
  const fetchServerNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        interface ServerNotification {
          id: string;
          title: string;
          body: string;
          createdAt: string;
          readStatus: boolean;
          bookingId?: string;
          role: "ADMIN" | "CUSTOMER";
        }
        data.notifications.forEach((sn: ServerNotification) => {
          const exists = useNotificationStore.getState().notifications.some((n) => n.id === sn.id);
          if (!exists) {
            useNotificationStore.getState().addNotification({
              title: sn.title,
              body: sn.body,
              url: sn.role === "ADMIN" ? "/admin/bookings" : "/dashboard",
              bookingId: sn.bookingId,
              role: sn.role,
            });
          }
        });
      }
    } catch {
      // Ignore offline sync warning
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
    fetchServerNotifications();
  }, [fetchServerNotifications]);

  const handleEnablePush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await requestBrowserPermission();
      if (res === "granted") {
        setPermissionStatus("granted");
        toast.success("Phone Notifications Enabled! 🔔");
        await getFcmToken();
      } else {
        setPermissionStatus("denied");
        toast.error("Notification permission blocked in browser settings.");
      }
    } catch {
      toast.error("Could not request notification permission.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (id: string, url?: string) => {
    markAsRead(id);
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {});
    setIsOpen(false);
    if (url) {
      router.push(url);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchServerNotifications();
        }}
        className={`relative p-2.5 rounded-full transition-all duration-200 flex items-center justify-center min-w-[40px] min-h-[40px] ${
          variant === "dark"
            ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700"
            : "bg-white text-slate-700 hover:bg-slate-100 hover:text-[#0050cb] border border-slate-200 shadow-sm"
        }`}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-bounce text-[#0050cb]" : ""}`} />
        
        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          {/* Mobile backdrop shadow layer */}
          <div
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1px] z-40 sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-96 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-[#0050cb] dark:bg-blue-950 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Read All
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-400 hover:text-red-500 font-medium p-1 transition-colors"
                    title="Clear notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Push Notification Mobile Activation Banner */}
            {permissionStatus === "default" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Enable Mobile Alerts</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Get push notifications on your phone</p>
                  </div>
                </div>
                <button
                  onClick={handleEnablePush}
                  className="px-3 py-1.5 bg-[#0066ff] text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition-colors shrink-0"
                >
                  Turn On
                </button>
              </div>
            )}

            {/* List */}
            <div className="max-h-[65vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {userNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
                  <p className="text-xs font-medium">No notifications yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Updates regarding your bookings will appear here.</p>
                </div>
              ) : (
                userNotifications.map((item: AppNotification) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.url)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start relative hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !item.read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span className="w-2 h-2 bg-[#0066ff] rounded-full shrink-0 mt-1.5 animate-pulse" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p
                          className={`text-xs font-bold ${
                            !item.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-3 leading-relaxed">
                        {item.body}
                      </p>

                      {item.url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5 hover:underline">
                          View Details <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
