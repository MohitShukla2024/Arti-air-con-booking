import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  url?: string;
  bookingId?: string;
  role?: "ADMIN" | "CUSTOMER";
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "welcome-notif-001",
          title: "Welcome to Arti Air Con",
          body: "You will receive real-time updates for your AC service bookings and technician assignments here.",
          timestamp: new Date().toISOString(),
          read: false,
          url: "/dashboard",
        },
      ],

      addNotification: (item) => {
        const newNotif: AppNotification = {
          ...item,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep max 50 recent
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "arti_air_con_notifications_v1",
    }
  )
);
