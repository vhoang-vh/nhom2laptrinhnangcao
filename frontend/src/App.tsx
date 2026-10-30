import { Navigate, Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<TenantHome />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
