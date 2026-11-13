import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "TENANT" as "TENANT" | "LANDLORD" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await register(form);
      if (form.role === "LANDLORD") {
        setSuccess("Đăng ký thành công. Tài khoản chủ nhà đang chờ quản trị viên duyệt.");
      } else {
        setSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
        window.setTimeout(() => navigate("/login"), 900);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.14)] md:p-7" onSubmit={submit}>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tham gia</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Tạo tài khoản</h2>
      </div>

      <label className="form-label">Họ và tên<input className="form-input" required maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
      <label className="form-label">Email<input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="form-label">Số điện thoại<input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className="form-label">Mật khẩu (ít nhất 8 ký tự)<input className="form-input" type="password" minLength={8} maxLength={72} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <label className="form-label">Bạn đăng ký với vai trò
        <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "TENANT" | "LANDLORD" })}>
          <option value="TENANT">Khách thuê</option><option value="LANDLORD">Chủ nhà</option>
        </select>
      </label>
      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
      {success && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{success}</p>}
      <button className="primary-button mt-6 w-full" disabled={busy}>{busy ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
      <p className="mt-5 text-center text-sm text-slate-500">Đã có tài khoản? <Link className="font-bold text-slate-900" to="/login">Đăng nhập</Link></p>
    </form>
  );
}
