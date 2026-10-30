import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "../services/api";
import { getUser } from "../services/auth";
import { createBooking, getRoom } from "../services/rentify";
import type { Room } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const user = getUser();

  useEffect(() => {
    if (id) getRoom(Number(id)).then(({ data }) => setRoom(data)).catch((e: unknown) => setError(getErrorMessage(e)));
  }, [id]);

  async function book() {
    if (!room) return;
    const date = window.prompt("Ngày dự kiến nhận phòng (YYYY-MM-DD):");
    if (!date) return;
    try {
      await createBooking(room.id, date, "");
      window.alert("Đã gửi yêu cầu đặt phòng đến chủ nhà.");
    } catch (e) { setError(getErrorMessage(e)); }
  }

  if (error) return <main className="mx-auto max-w-4xl px-5 py-12"><p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p><Link className="mt-4 inline-block text-brand-700" to="/">Quay lại</Link></main>;
  if (!room) return <main className="mx-auto max-w-4xl px-5 py-12 text-slate-500">Đang tải thông tin phòng...</main>;
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link className="text-sm font-bold text-brand-700" to="/">← Tất cả phòng</Link>
      <div className="mt-5 h-64 rounded-3xl bg-gradient-to-br from-teal-100 via-emerald-50 to-amber-100" />
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <section><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{room.area}</span><h1 className="mt-4 text-3xl font-black">{room.title}</h1><p className="mt-2 text-slate-500">{room.address}</p><h2 className="mt-8 text-xl font-extrabold">Thông tin phòng</h2><p className="mt-3 leading-7 text-slate-600">{room.description || "Chủ nhà chưa thêm mô tả."}</p><p className="mt-4 text-slate-600">Diện tích: <strong>{room.areaSquareMeters} m²</strong></p><p className="mt-2 text-slate-600">Chủ nhà: <strong>{room.landlordName}</strong></p></section>
        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-card"><p className="text-sm text-slate-500">Giá thuê mỗi tháng</p><p className="mt-1 text-2xl font-black text-brand-700">{money.format(room.monthlyRent)}</p>{user?.role === "TENANT" ? <button className="primary-button mt-5 w-full" onClick={() => void book()}>Gửi yêu cầu đặt phòng</button> : <Link className="primary-button mt-5 block text-center" to="/login">Đăng nhập để đặt phòng</Link>}</aside>
      </div>
    </main>
  );
}
