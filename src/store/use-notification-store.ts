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
  role?: "ADMIN" | "CUSTOMER" | "ALL";
}

interface NotificationState {
  notifications: AppNotification[];
  setNotifications: (list: AppNotification[]) => void;
  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "read"> & { id?: string; read?: boolean; timestamp?: string }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      setNotifications: (list) => set({ notifications: list }),

      addNotification: (item) => {
        const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const timestamp = item.timestamp || new Date().toISOString();
        const read = item.read ?? false;

        const newNotif: AppNotification = {
          id,
          title: item.title,
          body: item.body,
          url: item.url,
          bookingId: item.bookingId,
          role: item.role,
          timestamp,
          read,
        };

        set((state) => {
          const exists = state.notifications.some((n) => n.id === id);
          if (exists) {
            return {
              notifications: state.notifications.map((n) => (n.id === id ? newNotif : n)),
            };
          }
          return {
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        });
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

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "arti_air_con_notifications_v2",
    }
  )
);
