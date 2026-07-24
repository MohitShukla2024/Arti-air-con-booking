import { create } from "zustand";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site-settings";

interface SystemSettingsState {
  brandName: string;
  emergencyPhone: string;
  supportEmail: string;
  phone: string;
  address: string;
  workingHours: string;
  baseServiceFee: string;
  gasRefillFee: string;
  emergencyFee: string;
  smsNotifications: boolean;
  emailAlerts: boolean;
  adminPasscode: string;
  sessionTimeoutMins: string;
  autoAssignTechnicians: boolean;
  technicianName: string;
  technicianPhone: string;

  updateSettings: (newSettings: Partial<SiteSettings> & Partial<Pick<SystemSettingsState, "adminPasscode">>) => void;
}

export const useSettingsStore = create<SystemSettingsState>((set) => ({
  ...DEFAULT_SITE_SETTINGS,
  adminPasscode: "ADMIN2024",

  updateSettings: (newSettings) =>
    set((state) => ({
      ...state,
      ...newSettings,
    })),
}));
