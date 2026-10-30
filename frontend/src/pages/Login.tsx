import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2">
      <section><p className="font-bold uppercase tracking-[.2em] text-brand-700">Chào mừng trở lại</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl">Không gian tốt<br />bắt đầu từ đây.</h1>
        <p className="mt-5 max-w-md leading-7 text-slate-500">Đăng nhập để quản lý căn hộ, theo dõi yêu cầu đặt phòng và hóa đơn của bạn.</p>
      </section>
      <form className="rounded-3xl border border-slate-100 bg-white p-8 shadow-card" onSubmit={submit}>
        <h2 className="text-2xl font-extrabold">Đăng nhập</h2>
        <label className="form-label">Email<input className="form-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="form-label">Mật khẩu<input className="form-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        <button className="primary-button mt-6 w-full" disabled={busy}>{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <p className="mt-5 text-center text-sm text-slate-500">Chưa có tài khoản? <Link className="font-bold text-brand-700" to="/register">Đăng ký ngay</Link></p>
      </form>
    </main>
  );
}
