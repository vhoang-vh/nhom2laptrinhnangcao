export type Role = "ADMIN" | "LANDLORD" | "TENANT";
export type RoomStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type InvoiceStatus = "UNPAID" | "PAID";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  approved: boolean;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  user: User;
}

export interface Room {
  id: number;
  landlordId: number;
  landlordName: string;
  title: string;
  address: string;
  area: string;
  monthlyRent: number;
  areaSquareMeters: number;
  description: string | null;
  status: RoomStatus;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface Booking {
  id: number;
  roomId: number;
  roomTitle: string;
  tenantId: number;
  tenantName: string;
  moveInDate: string;
  message: string | null;
  status: BookingStatus;
  createdAt: string;
}

export interface Invoice {
  id: number;
  roomId: number;
  roomTitle: string;
  tenantId: number;
  tenantName: string;
  billingMonth: string;
  rentAmount: number;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
}

export interface AdminStats {
  totalUsers: number;
  totalLandlords: number;
  pendingLandlords: number;
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  pendingBookings: number;
  paidInvoiceRevenue: number;
}
