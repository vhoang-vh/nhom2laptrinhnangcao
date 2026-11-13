import { Link } from "react-router-dom";
import type { Room } from "../types";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)]">
      <div className="flex h-40 items-end bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_35%,#dfe7ea_100%)] p-5">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{room.area}</span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-bold text-slate-900">{room.title}</h2>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Còn phòng</span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">{room.address}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black text-slate-900">
              {currency.format(room.monthlyRent)}
              <span className="ml-1 text-xs font-medium text-slate-400">/tháng</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{room.areaSquareMeters} m² · Chủ nhà {room.landlordName}</p>
          </div>

          <Link className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800" to={`/rooms/${room.id}`}>
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
