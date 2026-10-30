import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../services/auth";
import type { Role } from "../types";

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  if (!user.approved) return <Navigate to="/pending-approval" replace />;
  return <Outlet />;
}
