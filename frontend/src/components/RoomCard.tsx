import { Link } from "react-router-dom";
import type { Room } from "../types";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const roomImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
];

function getRoomImage(room: Room) {
  const index = (room.id + room.title.length) % roomImages.length;
  return roomImages[index];
}

export default function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)]">
      <div className="relative h-40 overflow-hidden">
        <img
          src={getRoomImage(room)}
          alt={room.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-white/5" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{room.area}</span>
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
