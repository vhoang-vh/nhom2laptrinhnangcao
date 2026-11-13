import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { getUser } from "./services/auth";
import AdminDashboard from "./pages/AdminDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import Login from "./pages/Login";
import PendingApproval from "./pages/PendingApproval";
import Register from "./pages/Register";
import RoomDetail from "./pages/RoomDetail";
import TenantHome from "./pages/TenantHome";

function DashboardRouter() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.approved) return <Navigate to="/pending-approval" replace />;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "LANDLORD") return <LandlordDashboard />;
  return <TenantHome />;
}

function AuthOverlay({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const Content = mode === "login" ? Login : Register;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        navigate("/", { replace: true });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">
        <TenantHome />
      </div>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/30 px-4 py-10 backdrop-blur-[1.5px]">
        <div className="relative w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            aria-label="Đóng"
            className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            ×
          </button>
          <Content />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<TenantHome />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/login" element={<AuthOverlay mode="login" />} />
        <Route path="/register" element={<AuthOverlay mode="register" />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
        </Route>
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["LANDLORD"]} />}>
          <Route path="/landlord" element={<LandlordDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["TENANT"]} />}>
          <Route path="/tenant" element={<TenantHome />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="mt-16 border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} Rentify · Nhà thuê dễ dàng</footer>
    </div>
  );
}
