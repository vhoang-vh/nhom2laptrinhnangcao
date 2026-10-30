import { Link } from "react-router-dom";
import type { Room } from "../types";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function RoomCard({ room }: { room: Room }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1">
      <div className="flex h-36 items-end bg-gradient-to-br from-teal-100 via-emerald-50 to-amber-100 p-5">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-700">{room.area}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-slate-900">{room.title}</h2>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Còn phòng</span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{room.address}</p>
        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-lg font-extrabold text-brand-700">{currency.format(room.monthlyRent)}<span className="text-xs font-medium text-slate-400">/tháng</span></p>
            <p className="mt-1 text-xs text-slate-500">{room.areaSquareMeters} m² · Chủ nhà {room.landlordName}</p></div>
          <Link className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100" to={`/rooms/${room.id}`}>Chi tiết</Link>
        </div>
      </div>
    </article>
  );
}
