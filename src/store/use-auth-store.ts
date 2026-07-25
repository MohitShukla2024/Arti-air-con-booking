import { create } from "zustand";
import { UserProfile } from "@/types";
import { unregisterFcmToken } from "@/lib/firebase/client";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHydrated: boolean;
  loginCustomer: (user: UserProfile) => void;
  loginAdmin: (admin: UserProfile) => void;
  setSessionUser: (user: UserProfile | null) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Unauthenticated by default — User MUST log in first
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isHydrated: false,

  loginCustomer: (user) =>
    set({
      user,
      isAuthenticated: true,
      isAdmin: false,
      isHydrated: true,
    }),
  loginAdmin: (admin) =>
    set({
      user: admin,
      isAuthenticated: true,
      isAdmin: true,
      isHydrated: true,
    }),
  setSessionUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      isHydrated: true,
    }),
  updateUserProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  logout: async () => {
    try {
      await unregisterFcmToken();
    } catch (e) {
      console.warn("[AuthStore] Token unregister warning:", e);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[AuthStore] Logout fetch error:", err);
    }
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isHydrated: true,
    });
  },
  logoutAdmin: async () => {
    try {
      await unregisterFcmToken();
    } catch (e) {
      console.warn("[AuthStore] Token unregister warning:", e);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[AuthStore] Admin logout fetch error:", err);
    }
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isHydrated: true,
    });
  },
}));
