import { BRAND_INFO } from "@/lib/constants";

export type SiteSettings = {
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
  autoAssignTechnicians: boolean;
  sessionTimeoutMins: string;
  adminPasscode: string;
  technicianName: string;
  technicianPhone: string;
};

export const SITE_SETTINGS_ID = "site-settings";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: BRAND_INFO.name,
  emergencyPhone: BRAND_INFO.emergencyPhone,
  supportEmail: BRAND_INFO.email,
  phone: BRAND_INFO.phone,
  address: BRAND_INFO.address,
  workingHours: "08:00 AM - 08:00 PM (Mon-Sun)",
  baseServiceFee: "450",
  gasRefillFee: "1200",
  emergencyFee: "300",
  smsNotifications: true,
  emailAlerts: true,
  autoAssignTechnicians: false,
  sessionTimeoutMins: "60",
  adminPasscode: "",
  technicianName: "Nitesh Kumar Sharma",
  technicianPhone: "+91 9264173334",
};

export function normalizeSiteSettings(
  settings?: Partial<SiteSettings> | Record<string, unknown> | null
): SiteSettings {
  if (!settings) return DEFAULT_SITE_SETTINGS;
  return {
    ...DEFAULT_SITE_SETTINGS,
    brandName: (settings.brandName as string) || DEFAULT_SITE_SETTINGS.brandName,
    emergencyPhone: (settings.emergencyPhone as string) || DEFAULT_SITE_SETTINGS.emergencyPhone,
    supportEmail: (settings.supportEmail as string) || DEFAULT_SITE_SETTINGS.supportEmail,
    phone: (settings.phone as string) || DEFAULT_SITE_SETTINGS.phone,
    address: (settings.address as string) || DEFAULT_SITE_SETTINGS.address,
    workingHours: (settings.workingHours as string) || DEFAULT_SITE_SETTINGS.workingHours,
    baseServiceFee: (settings.baseServiceFee as string) || DEFAULT_SITE_SETTINGS.baseServiceFee,
    gasRefillFee: (settings.gasRefillFee as string) || DEFAULT_SITE_SETTINGS.gasRefillFee,
    emergencyFee: (settings.emergencyFee as string) || DEFAULT_SITE_SETTINGS.emergencyFee,
    smsNotifications: typeof settings.smsNotifications === "boolean" ? settings.smsNotifications : DEFAULT_SITE_SETTINGS.smsNotifications,
    emailAlerts: typeof settings.emailAlerts === "boolean" ? settings.emailAlerts : DEFAULT_SITE_SETTINGS.emailAlerts,
    autoAssignTechnicians: typeof settings.autoAssignTechnicians === "boolean" ? settings.autoAssignTechnicians : DEFAULT_SITE_SETTINGS.autoAssignTechnicians,
    sessionTimeoutMins: (settings.sessionTimeoutMins as string) || DEFAULT_SITE_SETTINGS.sessionTimeoutMins,
    adminPasscode: (settings.adminPasscode as string) ?? DEFAULT_SITE_SETTINGS.adminPasscode,
    technicianName: (settings.technicianName as string) || DEFAULT_SITE_SETTINGS.technicianName,
    technicianPhone: (settings.technicianPhone as string) || DEFAULT_SITE_SETTINGS.technicianPhone,
  };
}