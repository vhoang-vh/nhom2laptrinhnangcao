import { Link } from "react-router-dom";

export default function PendingApproval() {
  return <main className="mx-auto max-w-xl px-5 py-20 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-3xl">⌛</div><h1 className="mt-6 text-3xl font-black">Tài khoản đang chờ duyệt</h1><p className="mt-3 leading-7 text-slate-500">Quản trị viên cần duyệt hồ sơ chủ nhà trước khi bạn có thể đăng nhập và đăng tin.</p><Link className="mt-6 inline-block font-bold text-brand-700" to="/">Về trang chủ</Link></main>;
}
