import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../stores/authStore";

export function RequireAuth() {
    const status = useAuthStore((s) => s.status);
    const location = useLocation();

    if (status === "loading") return <div>Checking session…</div>;
    if (status === "guest")
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return <Outlet />;
}