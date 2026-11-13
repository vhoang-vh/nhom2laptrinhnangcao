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
    <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.14)] md:p-7" onSubmit={submit}>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Đăng nhập</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Chào mừng trở lại</h2>
      </div>

      <label className="form-label">Email
        <input className="form-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="form-label">Mật khẩu
        <input className="form-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}

      <button className="primary-button mt-6 w-full" disabled={busy}>{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản? <Link className="font-bold text-slate-900" to="/register">Đăng ký ngay</Link>
      </p>
    </form>
  );
}
