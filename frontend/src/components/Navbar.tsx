import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="app-shell flex items-center justify-between py-4">
        <Link className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900" to="/">
          <span className="rounded-xl bg-slate-900 px-2 py-1 text-base font-black text-white">R</span>
          <span>rentify</span>
          <span className="text-slate-400">.</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          {user ? (
            <>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 sm:inline">{user.fullName}</span>
              <Link className="transition hover:text-slate-900" to="/dashboard">Trang quản lý</Link>
              <button className="secondary-button px-3 py-2" onClick={signOut}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link className="transition hover:text-slate-900" to="/login">Đăng nhập</Link>
              <Link className="primary-button px-4 py-2.5" to="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
