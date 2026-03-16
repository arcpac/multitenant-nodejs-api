import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<any>("");
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
    <div className="min-h-screen bg-amber-50 px-4 py-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">


        <section className="mt-6 flex justify-center text-[#1a1a29] dark:text-zinc-400">
          <article className="w-full max-w-md rounded-2xl border border-zinc-800 bg-white p-6 shadow dark:bg-zinc-900/70">
            <h2 className="text-base font-semibold">Welcome back</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide">Email</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-800 px-3 py-2 text-sm  outline-none transition bg-amber-50 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide">Password</label>
                <input
                  className="mt-1 w-full bg-amber-50 rounded-lg border border-zinc-800 px-3 py-2 text-sm outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700"
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                onClick={async () => {
                  try {
                    setError("");
                    await login(email, password);
                  } catch (e) {
                    console.error(e);
                    setError("Login failed");
                  }
                }}
                className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
              >
                Login
              </button>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
