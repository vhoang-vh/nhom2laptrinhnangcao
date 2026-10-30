import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import StatusBadge from "../components/StatusBadge";
import { getErrorMessage } from "../services/api";
import { createInvoice, decideBooking, deleteRoom, getLandlordBookings, getLandlordInvoices, getMyRooms, saveRoom, completeBooking } from "../services/rentify";
import type { Booking, Invoice, Room, RoomStatus } from "../types";

const initialRoom = { title: "", address: "", area: "", monthlyRent: "", areaSquareMeters: "", description: "" };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function LandlordDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [roomForm, setRoomForm] = useState(initialRoom);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [utility, setUtility] = useState({ electricity: "0", water: "0", service: "0", month: new Date().toISOString().slice(0, 7) });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [roomResult, bookingResult, invoiceResult] = await Promise.all([getMyRooms(), getLandlordBookings(), getLandlordInvoices()]);
      setRooms(roomResult.data);
      setBookings(bookingResult.data);
      setInvoices(invoiceResult.data);
    } catch (e) { setError(getErrorMessage(e)); }
  }

  useEffect(() => { void load(); }, []);

  async function addRoom(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await saveRoom({ ...roomForm, monthlyRent: Number(roomForm.monthlyRent), areaSquareMeters: Number(roomForm.areaSquareMeters), status: editingRoomId ? rooms.find((room) => room.id === editingRoomId)?.status : "AVAILABLE" }, editingRoomId ?? undefined);
      setRoomForm(initialRoom);
      setEditingRoomId(null);
      await load();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  async function removeRoom(id: number) {
    if (!window.confirm("Bạn chắc chắn muốn xóa phòng này?")) return;
    try { await deleteRoom(id); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }

  async function updateStatus(room: Room, status: RoomStatus) {
    try { await saveRoom({ ...room, status }, room.id); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }

  function editRoom(room: Room) {
    setEditingRoomId(room.id);
    setRoomForm({
      title: room.title,
      address: room.address,
      area: room.area,
      monthlyRent: String(room.monthlyRent),
      areaSquareMeters: String(room.areaSquareMeters),
      description: room.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function decision(booking: Booking, status: "APPROVED" | "REJECTED") {
    try { await decideBooking(booking.id, status); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }

  async function finish(booking: Booking) {
    try { await completeBooking(booking.id); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }

  async function invoice(event: FormEvent) {
    event.preventDefault();
    if (!selectedBooking) return;
    try {
      await createInvoice({
        roomId: selectedBooking.roomId,
        tenantId: selectedBooking.tenantId,
        billingMonth: `${utility.month}-01`,
        electricityAmount: Number(utility.electricity),
        waterAmount: Number(utility.water),
        serviceAmount: Number(utility.service),
      });
      setSelectedBooking(null);
      await load();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  return <main className="mx-auto max-w-7xl px-5 py-10">
    <p className="font-bold uppercase tracking-[.2em] text-brand-700">Không gian chủ nhà</p><h1 className="mt-2 text-3xl font-black">Quản lý cho thuê</h1>
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
      <form className="h-fit rounded-2xl bg-white p-6 shadow-card" onSubmit={addRoom}><h2 className="text-xl font-extrabold">{editingRoomId ? "Cập nhật phòng" : "Đăng phòng mới"}</h2>
        <label className="form-label">Tên phòng<input className="form-input" required value={roomForm.title} onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })} /></label>
        <label className="form-label">Địa chỉ<input className="form-input" required value={roomForm.address} onChange={(e) => setRoomForm({ ...roomForm, address: e.target.value })} /></label>
        <label className="form-label">Khu vực<input className="form-input" required value={roomForm.area} onChange={(e) => setRoomForm({ ...roomForm, area: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="form-label">Giá/tháng<input className="form-input" type="number" min="1" required value={roomForm.monthlyRent} onChange={(e) => setRoomForm({ ...roomForm, monthlyRent: e.target.value })} /></label><label className="form-label">Diện tích m²<input className="form-input" type="number" min="1" step="0.1" required value={roomForm.areaSquareMeters} onChange={(e) => setRoomForm({ ...roomForm, areaSquareMeters: e.target.value })} /></label></div>
        <label className="form-label">Mô tả<textarea className="form-input" rows={3} value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} /></label>
        <button className="primary-button mt-5 w-full">{editingRoomId ? "Lưu thay đổi" : "Đăng tin"}</button>
        {editingRoomId && <button type="button" className="secondary-button mt-2 w-full" onClick={() => { setEditingRoomId(null); setRoomForm(initialRoom); }}>Hủy chỉnh sửa</button>}
      </form>
      <section><h2 className="text-2xl font-extrabold">Phòng của tôi <span className="text-slate-400">({rooms.length})</span></h2>
        <div className="mt-4 space-y-3">{rooms.length ? rooms.map((room) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm" key={room.id}><div><p className="font-bold">{room.title}</p><p className="text-sm text-slate-500">{room.area} · {money.format(room.monthlyRent)}</p></div><div className="flex items-center gap-2"><StatusBadge status={room.status} /><select aria-label={`Trạng thái ${room.title}`} className="rounded-lg border border-slate-200 p-2 text-xs" value={room.status} disabled={room.status === "RENTED"} onChange={(e) => void updateStatus(room, e.target.value as RoomStatus)}><option value="AVAILABLE">Còn phòng</option><option value="MAINTENANCE">Bảo trì</option></select><button className="text-sm font-semibold text-brand-700" onClick={() => editRoom(room)}>Sửa</button><button className="text-sm font-semibold text-rose-600" onClick={() => void removeRoom(room.id)}>Xóa</button></div></article>) : <p className="text-sm text-slate-500">Bạn chưa đăng phòng nào.</p>}</div>
        <h2 className="mt-10 text-2xl font-extrabold">Yêu cầu đặt phòng</h2>
        <div className="mt-4 space-y-3">{bookings.length ? bookings.map((booking) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm" key={booking.id}><div><p className="font-bold">{booking.roomTitle} · {booking.tenantName}</p><p className="text-sm text-slate-500">Ngày nhận phòng {booking.moveInDate}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={booking.status} />{booking.status === "PENDING" && <><button className="text-sm font-bold text-emerald-700" onClick={() => void decision(booking, "APPROVED")}>Duyệt</button><button className="text-sm font-bold text-rose-600" onClick={() => void decision(booking, "REJECTED")}>Từ chối</button></>}{booking.status === "APPROVED" && <><button className="text-sm font-bold text-brand-700" onClick={() => setSelectedBooking(booking)}>Lập hóa đơn</button><button className="text-sm font-bold text-slate-600" onClick={() => void finish(booking)}>Kết thúc thuê</button></>}</div></article>) : <p className="text-sm text-slate-500">Chưa có yêu cầu nào.</p>}</div>
      </section>
    </div>
    <section className="mt-10"><h2 className="text-2xl font-extrabold">Hóa đơn đã lập</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{invoices.length ? invoices.map((item) => <article className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm" key={item.id}><div><p className="font-bold">{item.roomTitle} · {item.tenantName}</p><p className="text-sm text-slate-500">{item.billingMonth.slice(0, 7)} · {money.format(item.totalAmount)}</p></div><StatusBadge status={item.status} /></article>) : <p className="text-sm text-slate-500">Chưa có hóa đơn.</p>}</div></section>
    {selectedBooking && <div className="fixed inset-0 z-20 grid place-items-center bg-slate-900/40 p-4"><form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={invoice}><div className="flex justify-between"><h2 className="text-xl font-extrabold">Lập hóa đơn</h2><button type="button" className="text-slate-400" onClick={() => setSelectedBooking(null)}>Đóng</button></div><p className="mt-2 text-sm text-slate-500">{selectedBooking.roomTitle} · {selectedBooking.tenantName}</p><label className="form-label">Tháng<input className="form-input" type="month" required value={utility.month} onChange={(e) => setUtility({ ...utility, month: e.target.value })} /></label><label className="form-label">Tiền điện<input className="form-input" type="number" min="0" required value={utility.electricity} onChange={(e) => setUtility({ ...utility, electricity: e.target.value })} /></label><label className="form-label">Tiền nước<input className="form-input" type="number" min="0" required value={utility.water} onChange={(e) => setUtility({ ...utility, water: e.target.value })} /></label><label className="form-label">Phí dịch vụ<input className="form-input" type="number" min="0" required value={utility.service} onChange={(e) => setUtility({ ...utility, service: e.target.value })} /></label><button className="primary-button mt-5 w-full">Tạo hóa đơn</button></form></div>}
  </main>;
}
