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
    useNotificationStore.getState().addNotification({
      title: "New Service Booking Placed!",
      body: `Booking #${booking.bookingCode || booking.id} for ${booking.serviceType} on ${booking.preferredDateTime} has been confirmed.`,
      url: "/dashboard",
      bookingId: booking.id,
    });

    set((state) => ({
      activeBooking: booking,
      bookingHistory: [booking, ...state.bookingHistory],
    }));
  },

  cancelBooking: (bookingId) => {
    useNotificationStore.getState().addNotification({
      title: "Booking Cancelled",
      body: `Booking #${bookingId} was successfully cancelled.`,
      url: "/dashboard",
      bookingId,
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
