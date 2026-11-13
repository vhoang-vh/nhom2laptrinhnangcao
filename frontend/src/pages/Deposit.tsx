import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { createBooking } from "../services/rentify";
import { getErrorMessage } from "../services/api";
import type { Room } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

type DepositMode = "FULL" | "HALF";

export default function Deposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingInfo = (location.state ?? {}) as {
    room?: Room;
    moveInDate?: string;
    durationMonths?: number;
  };

  const sessionBooking = typeof window !== "undefined" ? sessionStorage.getItem("rentify_booking") : null;
  const storedBooking = sessionBooking ? (JSON.parse(sessionBooking) as typeof bookingInfo) : null;
  const room = bookingInfo.room ?? storedBooking?.room;
  const moveInDate = bookingInfo.moveInDate ?? storedBooking?.moveInDate ?? "";
  const durationMonths = bookingInfo.durationMonths ?? storedBooking?.durationMonths ?? 1;
  const [depositMode, setDepositMode] = useState<DepositMode>("HALF");

  const depositAmount = useMemo(() => {
    if (!room) return 0;
    return depositMode === "FULL" ? room.monthlyRent * durationMonths : room.monthlyRent * 0.5;
  }, [depositMode, durationMonths, room]);

  async function submit() {
    if (!room || !moveInDate) {
      navigate("/", { replace: true });
      return;
    }

    try {
      sessionStorage.removeItem("rentify_booking");
      await createBooking(room.id, moveInDate, `Thuê ${durationMonths} tháng, đặt cọc ${depositMode === "FULL" ? "toàn bộ" : "một nửa"}.`);
      window.alert("Đã gửi yêu cầu đặt phòng thành công. Chủ nhà sẽ xét duyệt trong thời gian sớm nhất.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  }

  if (!room) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 text-center">
        <p className="text-lg font-semibold text-slate-700">Không tìm thấy thông tin đặt phòng.</p>
        <Link className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" to="/">
          Quay lại trang chủ
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link className="text-sm font-bold text-slate-700" to={`/rooms/${room.id}`}>
        ← Quay lại chi tiết phòng
      </Link>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Đặt cọc</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">Xác nhận đặt phòng</h1>

            <div className="mt-6 space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Phòng</span>
                <span className="text-sm font-semibold text-slate-900">{room.title}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Ngày nhận phòng</span>
                <span className="text-sm font-semibold text-slate-900">{moveInDate}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Thời gian thuê</span>
                <span className="text-sm font-semibold text-slate-900">{durationMonths} tháng</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Giá thuê</span>
                <span className="text-sm font-semibold text-slate-900">{money.format(room.monthlyRent)}/tháng</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">Chọn hình thức đặt cọc</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[{ value: "HALF", label: "Cọc một nửa", note: "50% giá thuê" }, { value: "FULL", label: "Cọc toàn bộ", note: "100% giá thuê" }].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDepositMode(option.value as DepositMode)}
                    className={`rounded-[1.25rem] border p-4 text-left transition ${depositMode === option.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"}`}
                  >
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className={`mt-1 text-xs ${depositMode === option.value ? "text-slate-200" : "text-slate-500"}`}>{option.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-900 p-6 text-white md:border-l md:border-t-0 md:p-8">
            <p className="text-sm text-slate-300">Số tiền cần đặt cọc</p>
            <p className="mt-2 text-4xl font-black">{money.format(depositAmount)}</p>
            <p className="mt-2 text-sm text-slate-300">
              {depositMode === "HALF" ? "Đặt cọc 50% để giữ phòng và thanh toán tiếp khi nhận nhà." : "Đặt cọc toàn bộ để xử lý hồ sơ nhanh hơn."}
            </p>

            <div className="mt-8 rounded-[1.5rem] bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Phương thức</span>
                <span className="font-medium text-white">VNPAY QR</span>
              </div>
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-slate-500 bg-slate-800/60 p-4">
                <div className="mx-auto grid max-w-[160px] grid-cols-5 gap-1 rounded-xl bg-white p-3">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-3 w-3 rounded-sm ${index % 2 === 0 || index % 3 === 0 ? "bg-slate-900" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-slate-300">Mã QR thanh toán</p>
              </div>
            </div>

            <button className="primary-button mt-8 w-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => void submit()}>
              Xác nhận và gửi yêu cầu
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
