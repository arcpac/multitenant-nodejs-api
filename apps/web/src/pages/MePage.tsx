import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useMe } from "../hooks/useMe";

function rolePillClass(role: string) {
  if (role === "OWNER") return "border-amber-300/40 bg-amber-500/20 text-amber-300";
  if (role === "ADMIN") return "border-sky-300/40 bg-sky-500/20 text-sky-300";
  return "border-emerald-300/40 bg-emerald-500/20 text-emerald-300";
}

function initialFromName(firstName: string | null, lastName: string | null, email: string) {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  const initials = `${a}${b}`.toUpperCase();
  if (initials) return initials;
  return email.trim().slice(0, 2).toUpperCase();
}

const MePage = () => {
  const { data: me, isLoading, isFetching, error, refetch } = useMe();
  const logout = useAuthStore((s) => s.logout);
  const members = me?.members ?? [];
  const owners = members.filter((m) => m.role === "OWNER").length;
  const admins = members.filter((m) => m.role === "ADMIN").length;
  const teamMembers = members.filter((m) => m.role === "MEMBER").length;
  const denominator = members.length || 1;
  const ownerPct = Math.round((owners / denominator) * 100);
  const adminPct = Math.round((admins / denominator) * 100);
  const memberPct = Math.round((teamMembers / denominator) * 100);
  const profileName = me ? `${me.user.firstName ?? ""} ${me.user.lastName ?? ""}`.trim() : "";

  if (isLoading && !me) {
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (error && !me) {
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50 px-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-white p-6 text-center shadow dark:bg-zinc-900/70">
          <h1 className="text-lg font-semibold">Could not load profile</h1>
          <p className="mt-2 text-sm text-zinc-500">Try refreshing your data.</p>
          <button
            onClick={() => void refetch()}
            className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#10162f] p-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Student Center</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{profileName || me?.user.email || "My Profile"}</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-300">
                Access level for <span className="font-medium">{me?.activeOrg.name ?? "your org"}</span> with
                a pricing-style overview of your team membership.
              </p>
              {isFetching && <p className="mt-2 text-xs text-zinc-400">Refreshing profile data...</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  try {
                    await refetch();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                disabled={isFetching}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to="/dashboard"
                aria-label="Back to dashboard"
                title="Dashboard"
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
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3 text-[#1a1a29] dark:text-zinc-400">
          <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#10162f] p-5 text-white shadow lg:col-span-2">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(16,22,47,0.98),rgba(44,56,99,0.9))]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Membership</p>
              <h2 className="mt-2 text-2xl font-semibold">Pro Team Access</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-300">
                Your organization has <span className="font-semibold text-white">{members.length}</span> active
                member{members.length === 1 ? "" : "s"} across the workspace.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Organization</p>
                  <p className="mt-2 font-semibold">{me?.activeOrg.name ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Role</p>
                  <p className="mt-2 font-semibold">{me?.role ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Seat Usage</p>
                  <p className="mt-2 font-semibold">{members.length} occupied</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-white p-5 shadow dark:bg-zinc-900/70">
            <h2 className="text-base font-semibold">Profile</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#10162f] p-3 text-white">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-500/20 text-sm font-semibold text-amber-300">
                {initialFromName(me?.user.firstName ?? null, me?.user.lastName ?? null, me?.user.email ?? "")}
              </div>
              <div>
                <p className="text-sm font-medium">{profileName || "Unnamed Member"}</p>
                <p className="text-xs text-zinc-400">{me?.user.email ?? "-"}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#10162f] px-3 py-2 text-white">
                <span className="text-zinc-400">Member Status</span>
                <span className="font-medium text-zinc-100">Active</span>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3 text-[#1a1a29] dark:text-zinc-400">
          <article className="rounded-2xl border border-zinc-800 bg-white p-5 shadow dark:bg-zinc-900/70">
            <h2 className="text-base font-semibold">Role Distribution</h2>
            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>Owners</span>
                  <span>{owners}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-amber-400" style={{ width: `${ownerPct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>Admins</span>
                  <span>{admins}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-sky-400" style={{ width: `${adminPct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>Members</span>
                  <span>{teamMembers}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${memberPct}%` }} />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-white p-5 shadow dark:bg-zinc-900/70 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Org Members</h2>
              <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs">{members.length} total</span>
            </div>

            <div className="mt-4 space-y-2">
              {members.map((member) => {
                const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.email;
                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#10162f] px-3 py-3 text-white sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200">
                        {initialFromName(member.firstName, member.lastName, member.email)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{name}</p>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-1 text-xs ${rolePillClass(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-[#10162f] px-3 py-4 text-sm text-zinc-400">
                  No members found for this organization.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default MePage;
