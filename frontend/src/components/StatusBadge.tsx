const styles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  UNPAID: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  RENTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  MAINTENANCE: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

const labels: Record<string, string> = {
  PENDING: "Chờ xử lý", APPROVED: "Đã duyệt", AVAILABLE: "Còn phòng", REJECTED: "Từ chối",
  CANCELLED: "Đã hủy", COMPLETED: "Hoàn tất", UNPAID: "Chưa thanh toán", PAID: "Đã thanh toán",
  RENTED: "Đã thuê", MAINTENANCE: "Bảo trì",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[status] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>{labels[status] ?? status}</span>;
}
