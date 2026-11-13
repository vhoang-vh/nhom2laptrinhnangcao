import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import RoomCard from "../components/RoomCard";
import StatusBadge from "../components/StatusBadge";
import { getErrorMessage } from "../services/api";
import { getUser } from "../services/auth";
import { getMyBookings, getMyInvoices, getRooms, markInvoicePaid } from "../services/rentify";
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
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(6);

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

  function requestBooking(room: Room) {
    setBookingRoom(room);
    setMoveInDate("");
    setDurationMonths(6);
  }

  function continueToDeposit() {
    if (!bookingRoom) return;
    sessionStorage.setItem("rentify_booking", JSON.stringify({ room: bookingRoom, moveInDate, durationMonths }));
    window.location.href = "/deposit";
  }

  async function pay(invoice: Invoice) {
    try {
      await markInvoicePaid(invoice.id);
      await loadPersonal();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  return (
    <main className="app-shell py-10">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d2c3d_45%,#0a766c_100%)] px-7 py-10 text-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] md:px-10 md:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">Tìm chốn an cư</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] md:text-6xl">Tìm căn phòng phù hợp với nhịp sống của bạn.</h1>
      </section>

      <form className="mt-8 grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:grid-cols-2 lg:grid-cols-7" onSubmit={search}>
        <input className="form-input !mt-0 lg:col-span-2" placeholder="Khu vực, địa chỉ..." value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Giá từ" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Giá đến" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Diện tích từ (m²)" value={filters.minArea} onChange={(e) => setFilters({ ...filters, minArea: e.target.value })} />
        <input className="form-input !mt-0" type="number" min="0" placeholder="Diện tích đến (m²)" value={filters.maxArea} onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })} />
        <button className="primary-button !mt-0">Tìm phòng</button>
      </form>

      {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700" role="alert">{error}</p>}

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Dành cho bạn</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Phòng đang cho thuê</h2>
          </div>
          <span className="text-sm text-slate-500">{rooms?.totalElements ?? 0} kết quả</span>
        </div>

        {rooms?.content.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms.content.map((room) => (
              <div key={room.id} className="space-y-2">
                <RoomCard room={room} />
                {user?.role === "TENANT" && (
                  <button className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" onClick={() => void requestBooking(room)}>
                    Gửi yêu cầu đặt phòng
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center text-slate-500">Chưa tìm thấy phòng phù hợp.</p>
        )}

        {!!rooms?.totalPages && rooms.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            <button className="secondary-button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Trước</button>
            <span className="py-2 text-sm text-slate-500">Trang {page + 1} / {rooms.totalPages}</span>
            <button className="secondary-button" disabled={page + 1 >= rooms.totalPages} onClick={() => setPage((p) => p + 1)}>Tiếp</button>
          </div>
        )}
      </section>

      {user?.role === "TENANT" && user.approved && (
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Lịch sử đặt phòng</h2>
            <div className="space-y-3">
              {bookings.length ? (
                bookings.map((booking) => (
                  <article className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]" key={booking.id}>
                    <div>
                      <p className="font-bold text-slate-900">{booking.roomTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">Nhận phòng: {booking.moveInDate}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">Bạn chưa gửi yêu cầu nào.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Hóa đơn của tôi</h2>
            <div className="space-y-3">
              {invoices.length ? (
                invoices.map((invoice) => (
                  <article className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]" key={invoice.id}>
                    <div>
                      <p className="font-bold text-slate-900">{invoice.roomTitle} · {invoice.billingMonth.slice(0, 7)}</p>
                      <p className="mt-1 text-sm text-slate-500">{money.format(invoice.totalAmount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={invoice.status} />
                      {invoice.status === "UNPAID" && (
                        <button className="text-sm font-bold text-slate-900" onClick={() => void pay(invoice)}>Đã thanh toán</button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có hóa đơn.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {bookingRoom && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.2)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Đặt phòng</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{bookingRoom.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setBookingRoom(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-xl font-bold text-slate-600 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Ngày dự kiến nhận phòng</span>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(event) => setMoveInDate(event.target.value)}
                  className="form-input !mt-0"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Thời gian đặt trong bao lâu</span>
                <select
                  value={durationMonths}
                  onChange={(event) => setDurationMonths(Number(event.target.value))}
                  className="form-input !mt-0"
                >
                  <option value={1}>1 tháng</option>
                  <option value={3}>3 tháng</option>
                  <option value={6}>6 tháng</option>
                  <option value={12}>12 tháng</option>
                </select>
              </label>

              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Giá thuê</span>
                  <span className="font-semibold text-slate-900">{money.format(bookingRoom.monthlyRent)}/tháng</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>Thời gian</span>
                  <span className="font-semibold text-slate-900">{durationMonths} tháng</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="secondary-button" onClick={() => setBookingRoom(null)}>Hủy</button>
              <button
                type="button"
                className="primary-button"
                disabled={!moveInDate}
                onClick={continueToDeposit}
              >
                Chuyển qua trang đặt cọc
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
