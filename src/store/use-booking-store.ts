import { create } from "zustand";
import { ServiceBooking } from "@/types";
import { useNotificationStore } from "@/store/use-notification-store";

interface BookingStoreState {
  activeBooking: ServiceBooking | null;
  bookingHistory: ServiceBooking[];
  selectedService: string | null;

  // Actions
  setSelectedService: (serviceTitle: string | null) => void;
  setActiveBooking: (booking: ServiceBooking | null) => void;
  addBooking: (booking: ServiceBooking) => void;
  cancelBooking: (bookingId: string) => void;
  setBookingHistory: (history: ServiceBooking[]) => void;
}

export const useBookingStore = create<BookingStoreState>((set) => ({
  // Clean dynamic state — no hardcoded static mock data
  activeBooking: null,
  bookingHistory: [],
  selectedService: null,

  setSelectedService: (serviceTitle) => set({ selectedService: serviceTitle }),

  setActiveBooking: (booking) => set({ activeBooking: booking }),

  addBooking: (booking) => {
    const code = booking.bookingCode || booking.id;

    // 1. Notification targeted for CUSTOMER
    useNotificationStore.getState().addNotification({
      title: "Booking Submitted Successfully 📝",
      body: `Your booking #${code} for ${booking.serviceType} has been received. Our team will assign a technician shortly.`,
      url: "/dashboard",
      bookingId: booking.id,
      role: "CUSTOMER",
    });

    // 2. Notification targeted for ADMIN
    useNotificationStore.getState().addNotification({
      title: "New Booking Received! 🚨",
      body: `New booking #${code} placed by ${booking.fullName || "Customer"} (${booking.mobileNumber || ""}) for ${booking.serviceType}. Needs technician assignment.`,
      url: "/admin/dashboard?tab=bookings",
      bookingId: booking.id,
      role: "ADMIN",
    });

    set((state) => ({
      activeBooking: booking,
      bookingHistory: [booking, ...state.bookingHistory],
    }));
  },

  cancelBooking: (bookingId) => {
    // 1. Notification targeted for CUSTOMER
    useNotificationStore.getState().addNotification({
      title: "Booking Cancelled ❌",
      body: `Your booking #${bookingId} was successfully cancelled.`,
      url: "/dashboard",
      bookingId,
      role: "CUSTOMER",
    });

    // 2. Notification targeted for ADMIN
    useNotificationStore.getState().addNotification({
      title: "Booking Cancelled by Customer ⚠️",
      body: `Customer cancelled booking #${bookingId}.`,
      url: "/admin/dashboard?tab=bookings",
      bookingId,
      role: "ADMIN",
    });

    set((state) => ({
      activeBooking:
        state.activeBooking?.id === bookingId
          ? { ...state.activeBooking, status: "CANCELLED" }
          : state.activeBooking,
      bookingHistory: state.bookingHistory.map((b) =>
        b.id === bookingId ? { ...b, status: "CANCELLED" } : b
      ),
    }));
  },

  setBookingHistory: (history) => set({ bookingHistory: history }),
}));
