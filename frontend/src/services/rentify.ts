import { api } from "./api";
import type { AdminStats, Booking, Invoice, Page, Room, User } from "../types";

export interface RoomFilters {
  area?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  page?: number;
  size?: number;
}

export const getRooms = (filters: RoomFilters) =>
  api.get<Page<Room>>("/rooms", { params: { ...filters, sortBy: "createdAt", direction: "desc" } });
export const getRoom = (id: number) => api.get<Room>(`/rooms/${id}`);
export const getMyRooms = () => api.get<Room[]>("/rooms/mine");
export const saveRoom = (room: Partial<Room>, id?: number) =>
  id ? api.put<Room>(`/rooms/${id}`, room) : api.post<Room>("/rooms", room);
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}`);
export const createBooking = (roomId: number, moveInDate: string, message: string) =>
  api.post<Booking>("/bookings", { roomId, moveInDate, message });
export const getMyBookings = () => api.get<Booking[]>("/bookings/mine");
export const getLandlordBookings = () => api.get<Booking[]>("/bookings/landlord");
export const decideBooking = (id: number, status: "APPROVED" | "REJECTED") =>
  api.patch<Booking>(`/bookings/${id}/decision`, { status });
export const completeBooking = (id: number) => api.patch<Booking>(`/bookings/${id}/complete`);
export const getMyInvoices = () => api.get<Invoice[]>("/invoices/mine");
export const getLandlordInvoices = () => api.get<Invoice[]>("/invoices/landlord");
export const createInvoice = (input: {
  roomId: number;
  tenantId: number;
  billingMonth: string;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
}) => api.post<Invoice>("/invoices", input);
export const markInvoicePaid = (id: number) => api.patch<Invoice>(`/invoices/${id}/paid`);
export const getAdminStats = () => api.get<AdminStats>("/admin/stats");
export const getPendingLandlords = () => api.get<User[]>("/admin/landlords/pending");
export const decideLandlord = (id: number, approved: boolean) =>
  api.patch<User>(`/admin/landlords/${id}/approval`, { approved });
