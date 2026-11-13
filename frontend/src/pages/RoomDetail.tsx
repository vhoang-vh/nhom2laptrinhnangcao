import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../services/api";
import { getUser } from "../services/auth";
import { getRoom } from "../services/rentify";
import type { Room } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const roomImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
];

function getRoomImage(room: Room) {
  const index = (room.id + room.title.length) % roomImages.length;
  return roomImages[index];
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(6);
  const user = getUser();

  useEffect(() => {
    if (id) getRoom(Number(id)).then(({ data }) => setRoom(data)).catch((e: unknown) => setError(getErrorMessage(e)));
  }, [id]);

  function continueToDeposit() {
    if (!room || !moveInDate) return;
    navigate("/deposit", {
      state: { room, moveInDate, durationMonths },
      replace: false,
    });
  }

  if (error) return <main className="mx-auto max-w-4xl px-5 py-12"><p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p><Link className="mt-4 inline-block text-brand-700" to="/">Quay lại</Link></main>;
  if (!room) return <main className="mx-auto max-w-4xl px-5 py-12 text-slate-500">Đang tải thông tin phòng...</main>;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link className="text-sm font-bold text-slate-700" to="/">← Tất cả phòng</Link>
      <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <img src={getRoomImage(room)} alt={room.title} className="h-72 w-full object-cover md:h-96" />
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <section>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{room.area}</span>
          <h1 className="mt-4 text-3xl font-black text-slate-900">{room.title}</h1>
          <p className="mt-2 text-slate-500">{room.address}</p>
          <h2 className="mt-8 text-xl font-extrabold text-slate-900">Thông tin phòng</h2>
          <p className="mt-3 leading-7 text-slate-600">{room.description || "Chủ nhà chưa thêm mô tả."}</p>
          <p className="mt-4 text-slate-600">Diện tích: <strong>{room.areaSquareMeters} m²</strong></p>
          <p className="mt-2 text-slate-600">Chủ nhà: <strong>{room.landlordName}</strong></p>
        </section>
        <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Giá thuê mỗi tháng</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{money.format(room.monthlyRent)}</p>
          {user?.role === "TENANT" ? (
            <button className="primary-button mt-5 w-full" onClick={() => setShowBookingModal(true)}>Gửi yêu cầu đặt phòng</button>
          ) : user ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {user.role === "ADMIN"
                ? "Tài khoản quản trị không gửi yêu cầu đặt phòng."
                : "Chủ nhà quản lý yêu cầu thuê trong trang quản lý."}
              {" "}
              <Link className="font-bold text-brand-700" to="/dashboard">Về trang quản lý</Link>
            </p>
          ) : (
            <Link className="primary-button mt-5 block text-center" to="/login">Đăng nhập để đặt phòng</Link>
          )}
        </aside>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.2)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Đặt phòng</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{room.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setShowBookingModal(false)}
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
                  <span className="font-semibold text-slate-900">{money.format(room.monthlyRent)}/tháng</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>Thời gian</span>
                  <span className="font-semibold text-slate-900">{durationMonths} tháng</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="secondary-button" onClick={() => setShowBookingModal(false)}>Hủy</button>
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
