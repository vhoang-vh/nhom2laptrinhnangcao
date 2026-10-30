const styles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  UNPAID: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  RENTED: "bg-blue-50 text-blue-700",
  MAINTENANCE: "bg-orange-50 text-orange-700",
};

const labels: Record<string, string> = {
  PENDING: "Chờ xử lý", APPROVED: "Đã duyệt", AVAILABLE: "Còn phòng", REJECTED: "Từ chối",
  CANCELLED: "Đã hủy", COMPLETED: "Hoàn tất", UNPAID: "Chưa thanh toán", PAID: "Đã thanh toán",
  RENTED: "Đã thuê", MAINTENANCE: "Bảo trì",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>{labels[status] ?? status}</span>;
}
