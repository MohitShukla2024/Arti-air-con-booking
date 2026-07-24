import { create } from "zustand";
import { ServiceBooking } from "@/types";

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

  addBooking: (booking) =>
    set((state) => ({
      activeBooking: booking,
      bookingHistory: [booking, ...state.bookingHistory],
    })),

  cancelBooking: (bookingId) =>
    set((state) => ({
      activeBooking:
        state.activeBooking?.id === bookingId
          ? { ...state.activeBooking, status: "CANCELLED" }
          : state.activeBooking,
      bookingHistory: state.bookingHistory.map((b) =>
        b.id === bookingId ? { ...b, status: "CANCELLED" } : b
      ),
    })),

  setBookingHistory: (history) => set({ bookingHistory: history }),
}));
