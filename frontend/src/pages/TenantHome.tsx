import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import RoomCard from "../components/RoomCard";
import StatusBadge from "../components/StatusBadge";
import { getErrorMessage } from "../services/api";
import { getUser } from "../services/auth";
import { createBooking, getMyBookings, getMyInvoices, getRooms, markInvoicePaid } from "../services/rentify";
import type { Booking, Invoice, Page, Room } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function TenantHome() {
  const user = getUser();
  const [rooms, setRooms] = useState<Page<Room> | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState({ area: "", minPrice: "", maxPrice: "", minArea: "", maxArea: "" });
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  async function loadRooms() {
    try {
      setError("");
      const { data } = await getRooms({ ...filters, page, size: 9 });
      setRooms(data);
    } catch (e) { setError(getErrorMessage(e)); }
  }

  async function loadPersonal() {
    try {
      const [bookingResult, invoiceResult] = await Promise.all([getMyBookings(), getMyInvoices()]);
      setBookings(bookingResult.data);
      setInvoices(invoiceResult.data);
    } catch (e) { setError(getErrorMessage(e)); }
  }

  useEffect(() => { void loadRooms(); }, [page]);
  useEffect(() => {
    if (user?.role === "TENANT" && user.approved) void loadPersonal();
  }, []);

  async function search(event: FormEvent) {
    event.preventDefault();
    setPage(0);
    try {
      const { data } = await getRooms({ ...filters, page: 0, size: 9 });
      setRooms(data);
      setError("");
    } catch (e) { setError(getErrorMessage(e)); }
  }

  async function requestBooking(room: Room) {
    const date = window.prompt("Ngày dự kiến nhận phòng (YYYY-MM-DD):");
    if (!date) return;
    try {
      await createBooking(room.id, date, "");
      window.alert("Đã gửi yêu cầu đặt phòng.");
      await loadPersonal();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  async function pay(invoice: Invoice) {
    try {
      await markInvoicePaid(invoice.id);
      await loadPersonal();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 to-brand-700 px-7 py-10 text-white md:px-12 md:py-14">
        <p className="text-sm font-bold uppercase tracking-[.22em] text-teal-100">Tìm chốn an cư</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight md:text-5xl">Tìm căn phòng hợp gu, đúng ngân sách.</h1>
        <p className="mt-4 text-teal-50">Khám phá phòng trọ và căn hộ cho thuê đáng tin cậy.</p>
      </section>
      <form className="mt-8 grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-7" onSubmit={search}>
        <input className="form-input !mt-0 lg:col-span-2" placeholder="Khu vực, địa chỉ..." value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Giá từ" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Giá đến" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Diện tích từ (m²)" value={filters.minArea} onChange={(e) => setFilters({ ...filters, minArea: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Diện tích đến (m²)" value={filters.maxArea} onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })} />
        <button className="primary-button">Tìm phòng</button>
      </form>
      {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700" role="alert">{error}</p>}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Dành cho bạn</p><h2 className="mt-1 text-2xl font-extrabold">Phòng đang cho thuê</h2></div><span className="text-sm text-slate-500">{rooms?.totalElements ?? 0} kết quả</span></div>
        {rooms?.content.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rooms.content.map((room) => <div key={room.id}><RoomCard room={room} />{user?.role === "TENANT" && <button className="mt-2 w-full rounded-xl border border-brand-200 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50" onClick={() => void requestBooking(room)}>Gửi yêu cầu đặt phòng</button>}</div>)}</div> : <p className="rounded-xl bg-white p-8 text-center text-slate-500">Chưa tìm thấy phòng phù hợp.</p>}
        {!!rooms?.totalPages && rooms.totalPages > 1 && <div className="mt-6 flex justify-center gap-3"><button className="secondary-button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Trước</button><span className="py-2 text-sm text-slate-500">Trang {page + 1} / {rooms.totalPages}</span><button className="secondary-button" disabled={page + 1 >= rooms.totalPages} onClick={() => setPage((p) => p + 1)}>Tiếp</button></div>}
      </section>
      {user?.role === "TENANT" && user.approved && (
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div><h2 className="mb-4 text-2xl font-extrabold">Lịch sử đặt phòng</h2><div className="space-y-3">{bookings.length ? bookings.map((booking) => <article className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm" key={booking.id}><div><p className="font-bold">{booking.roomTitle}</p><p className="mt-1 text-sm text-slate-500">Nhận phòng: {booking.moveInDate}</p></div><StatusBadge status={booking.status} /></article>) : <p className="text-sm text-slate-500">Bạn chưa gửi yêu cầu nào.</p>}</div></div>
          <div><h2 className="mb-4 text-2xl font-extrabold">Hóa đơn của tôi</h2><div className="space-y-3">{invoices.length ? invoices.map((invoice) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm" key={invoice.id}><div><p className="font-bold">{invoice.roomTitle} · {invoice.billingMonth.slice(0, 7)}</p><p className="mt-1 text-sm text-slate-500">{money.format(invoice.totalAmount)}</p></div><div className="flex items-center gap-2"><StatusBadge status={invoice.status} />{invoice.status === "UNPAID" && <button className="text-sm font-bold text-brand-700" onClick={() => void pay(invoice)}>Đã thanh toán</button>}</div></article>) : <p className="text-sm text-slate-500">Chưa có hóa đơn.</p>}</div></div>
        </section>
      )}
    </main>
  );
}
