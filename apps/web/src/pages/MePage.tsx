import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const MePage = () => {
  const me = useAuthStore((s) => s.me);
  const status = useAuthStore((s) => s.status);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const logout = useAuthStore((s) => s.logout);

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-100">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">/me (Protected)</h1>
            <p className="mt-1 text-sm text-zinc-400">
              This page is protected by <span className="font-mono">RequireAuth</span>.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={async () => {
                try {
                  await refreshMe();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              Refresh
            </button>
            <Link
              to="/dashboard"
              aria-label="Open profile"
              title="Profile"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 19a7 7 0 0 1 14 0" />
              </svg>
            </Link>

            <button
              onClick={() => logout()}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">User</div>
            <div className="mt-2 text-sm text-zinc-200">
              <div>
                <span className="text-zinc-500">Email:</span>{" "}
                <span className="font-medium">{me?.user.email ?? "—"}</span>
              </div>
              <div className="mt-1">
                <span className="text-zinc-500">Name:</span>{" "}
                <span className="font-medium">
                  {me ? `${me.user.first_name} ${me.user.last_name}` : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Org + Role</div>
            <div className="mt-2 text-sm text-zinc-200">
              <div>
                <span className="text-zinc-500">Active Org:</span>{" "}
                <span className="font-mono">
                  {(me?.activeOrg as any)?.id ?? "—"}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-zinc-500">Role:</span>{" "}
                <span className="font-medium">{me?.role ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Raw JSON</div>
          <pre className="mt-2 max-h-[60vh] overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-200">
            {JSON.stringify(me, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MePage;