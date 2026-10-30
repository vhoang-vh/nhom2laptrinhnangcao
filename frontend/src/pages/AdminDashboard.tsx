import { useEffect, useState } from "react";
import { getErrorMessage } from "../services/api";
import { decideLandlord, getAdminStats, getPendingLandlords } from "../services/rentify";
import type { AdminStats, User } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [landlords, setLandlords] = useState<User[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [statsResult, pendingResult] = await Promise.all([getAdminStats(), getPendingLandlords()]);
      setStats(statsResult.data);
      setLandlords(pendingResult.data);
    } catch (e) { setError(getErrorMessage(e)); }
  }

  useEffect(() => { void load(); }, []);

  async function approve(id: number) {
    try {
      await decideLandlord(id, true);
      await load();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  const cards = stats ? [
    ["Tổng người dùng", stats.totalUsers], ["Chủ nhà", stats.totalLandlords],
    ["Phòng đang trống", stats.availableRooms], ["Yêu cầu chờ", stats.pendingBookings],
    ["Chủ nhà chờ duyệt", stats.pendingLandlords], ["Tổng lượt đặt", stats.totalBookings],
  ] : [];

  return <main className="mx-auto max-w-7xl px-5 py-10">
    <p className="font-bold uppercase tracking-[.2em] text-brand-700">Quản trị hệ thống</p><h1 className="mt-2 text-3xl font-black">Tổng quan Rentify</h1>
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <article className="rounded-2xl bg-white p-5 shadow-card" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-brand-700">{value}</p></article>)}</div>
    <article className="mt-5 rounded-2xl bg-white p-6 shadow-card"><p className="text-sm text-slate-500">Doanh thu hóa đơn đã thanh toán</p><p className="mt-2 text-3xl font-black text-brand-700">{money.format(stats?.paidInvoiceRevenue ?? 0)}</p><p className="mt-1 text-xs text-slate-400">Tổng lũy kế theo hóa đơn được đánh dấu đã thanh toán.</p></article>
    <section className="mt-10"><h2 className="text-2xl font-extrabold">Chủ nhà chờ duyệt</h2><div className="mt-4 space-y-3">{landlords.length ? landlords.map((landlord) => <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm" key={landlord.id}><div><p className="font-bold">{landlord.fullName}</p><p className="text-sm text-slate-500">{landlord.email}{landlord.phone ? ` · ${landlord.phone}` : ""}</p></div><button className="primary-button !py-2" onClick={() => void approve(landlord.id)}>Duyệt tài khoản</button></article>) : <p className="text-slate-500">Không có tài khoản chờ duyệt.</p>}</div></section>
  </main>;
}
