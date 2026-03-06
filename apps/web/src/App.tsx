import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import MePage from "./pages/MePage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";


export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/me" replace />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/me" element={<MePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/me" replace />} />
    </Routes>
  );
}
