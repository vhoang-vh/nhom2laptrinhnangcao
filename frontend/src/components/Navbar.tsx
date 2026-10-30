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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="text-2xl font-black tracking-tight text-brand-700" to="/">rentify<span className="text-amber-500">.</span></Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          {user ? (
            <>
              <span className="hidden text-slate-600 sm:inline">{user.fullName}</span>
              <Link className="text-brand-700 hover:text-brand-900" to="/dashboard">Trang quản lý</Link>
              <button className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50" onClick={signOut}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link className="hover:text-brand-700" to="/login">Đăng nhập</Link>
              <Link className="rounded-lg bg-brand-700 px-4 py-2 text-white hover:bg-brand-900" to="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
