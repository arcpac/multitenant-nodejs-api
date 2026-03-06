import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useLocation, useNavigate } from "react-router-dom";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any>("")
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from ?? "/me";

  useEffect(() => {
    if (status === "authed") {
      navigate(from, { replace: true });
    }
  }, [status, from, navigate]);

  return (
    <div className="min-h-screen w-full grid place-items-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow">
        <h1 className="text-xl font-semibold">TeamBoard UI</h1>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-zinc-400">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-red-200 text-sm">
            <p>{error}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={async () => {
                try {
                  await login(email, password);
                } catch (e) {
                  console.error(e);
                  setError("Login failed ")
                }
              }}
              className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
