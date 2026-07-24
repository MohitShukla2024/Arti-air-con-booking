export type UserRole = "CUSTOMER" | "ADMIN";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  languagePref: "en" | "hi";
  address?: string;
  city?: string;
  pincode?: string;
  smsAlerts?: boolean;
  emailAlerts?: boolean;
}

export interface ServiceBooking {
  id: string;
  bookingCode: string;
  fullName: string;
  email?: string;
  mobileNumber: string;
  altMobile?: string;
  fullAddress: string;
  city: string;
  pincode: string;
  serviceType: string;
  acType: string;
  acBrand: string;
  problemDescription?: string;
  preferredDateTime: string;
  status: BookingStatus;
  amount: number;
  technicianName?: string;
  technicianPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalOrders: number;
  pending: number;
  accepted: number;
  completed: number;
  cancelled: number;
  totalOrdersGrowth: number;
  cancellationRate: number;
}

export interface TechnicianActivityItem {
  id: string;
  technicianName: string;
  avatarUrl?: string;
  actionDescription: string;
  bookingCode?: string;
  clientName?: string;
  location?: string;
  statusBadge: string;
  statusColor: string;
  timeAgo: string;
}

export interface CustomerHistoryItem {
  id: string;
  bookingCode: string;
  date: string;
  serviceType: string;
  amount: number;
  status: BookingStatus;
  hasReceipt: boolean;
}
