import { Link, useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../services/rentify";
import { getErrorMessage } from "../services/api";
import type { Room } from "../types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function Deposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingInfo = (location.state ?? {}) as {
    room?: Room;
    moveInDate?: string;
    durationMonths?: number;
  };

  const room = bookingInfo.room;
  const moveInDate = bookingInfo.moveInDate ?? "";
  const durationMonths = bookingInfo.durationMonths ?? 1;
  const depositAmount = room ? room.monthlyRent * 1 : 0;

  async function submit() {
    if (!room || !moveInDate) {
      navigate("/", { replace: true });
      return;
    }

    try {
      await createBooking(room.id, moveInDate, `Thuê ${durationMonths} tháng, đặt cọc tiền thuê.`);
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
    <main className="mx-auto max-w-4xl px-5 py-10">
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
          </div>

          <aside className="border-t border-slate-200 bg-slate-900 p-6 text-white md:border-l md:border-t-0 md:p-8">
            <p className="text-sm text-slate-300">Số tiền đặt cọc</p>
            <p className="mt-2 text-4xl font-black">{money.format(depositAmount)}</p>
            <p className="mt-2 text-sm text-slate-300">Đặt cọc 1 tháng tiền thuê để giữ phòng.</p>

            <div className="mt-8 space-y-3 rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Phương thức</span>
                <span className="font-medium text-white">Chuyển khoản</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Thanh toán</span>
                <span className="font-medium text-white">Một lần</span>
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
