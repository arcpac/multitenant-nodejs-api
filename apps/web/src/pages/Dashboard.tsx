import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useTheme } from "../theme/ThemeProvider";
import { useQuery } from '@tanstack/react-query';
import { gqlFetch } from '../lib/graphql';
import { Link } from 'react-router-dom';

type DashboardTask = {
    id: string;
    status: string;
    title: string
    priority: string;
    dueDate: string | null;
}

type DashboardTeam = {
    id: string;
    name: string
}

type DashboardData = {
    counts: {
        total: number;
        todo: number;
        doing: number;
        done: number;
    };
    tasks: DashboardTask[];
    teams: DashboardTeam[];
}

const DASHBOARD_QUERY = `
query Dashboard($teamId: ID) {
  dashboard(filter: { teamId: $teamId }) {
    counts { total todo doing done }
    teams { id name }
    tasks { id title status priority dueDate }
  }
}
`;

const Dashboard = () => {
    const { isDark, setIsDark } = useTheme();
    const { data: dashboardData, isLoading, isFetching, error } = useQuery({
        queryKey: ['dashboardData', { teamId: null }],
        queryFn: async () => {
            console.count('[Dashboard] queryFn executed');
            const data = await gqlFetch<{ dashboard: DashboardData }>(
                DASHBOARD_QUERY,
                { teamId: null }
            );
            return data.dashboard;
        },
        staleTime: 60_000, //staleTime does not survive a full page reload by itself,
        gcTime: 300_000,
    });


    const totalCount = dashboardData?.counts.total ?? 0;
    const todoCount = dashboardData?.counts.todo ?? 0;
    const doingCount = dashboardData?.counts.doing ?? 0;
    const doneCount = dashboardData?.counts.done ?? 0;

    return (
        <div className="min-h-screen bg-amber-50 px-4 py-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <section className="relative overflow-hidden bg-amber-50 dark:bg-zinc-950 p-6">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between text-[#1a1a29] dark:text-zinc-400">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em]">TeamBoard</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm">
                                A quick snapshot of team execution for today.
                            </p>
                            {isLoading && (
                                <p className="mt-2 text-xs text-zinc-500">Loading dashboard data...</p>
                            )}
                            {!isLoading && isFetching && (
                                <p className="mt-2 text-xs text-zinc-500">Refreshing data...</p>
                            )}
                            {error && (
                                <p className="mt-2 text-xs text-rose-500">
                                    Failed to load dashboard data.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800">
                                New Task
                            </button>
                            <button className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white">
                                Open Board
                            </button>
                            <DarkModeSwitch
                                checked={isDark}
                                onChange={setIsDark}
                                size={20}
                                className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
                            />
                            <Link
                                to="/me"
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
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 dark:bg-zinc-900/70 text-[#1a1a29] dark:text-zinc-400">
                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">Total Tasks</p>
                        <p className="mt-3 text-3xl font-semibold">{totalCount}</p>
                        <p className="mt-2 text-xs text-emerald-300">+3 from yesterday</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">To Do</p>
                        <p className="mt-3 text-3xl font-semibold">{todoCount}</p>
                        <p className="mt-2 text-xs text-zinc-400">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">In Progress</p>
                        <p className="mt-3 text-3xl font-semibold">{doingCount}</p>
                        <p className="mt-2 text-xs text-zinc-400">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">Done</p>
                        <p className="mt-3 text-3xl font-semibold">{doneCount}</p>
                        <p className="mt-2 text-xs text-emerald-300">25% completion rate</p>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-3 dark:bg-zinc-900/70 text-[#1a1a29] dark:text-zinc-400">
                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Priority Tasks</h2>
                            <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs">
                                3 urgent
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-zinc-800 text-white bg-[#10162f] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">Ship billing bug fix</p>
                                    <span className="rounded-md bg-rose-500/15 px-2 py-1 text-xs text-rose-300">
                                        High
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-400">Assigned to Alex • Due today</p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 text-white bg-[#10162f] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium text-zinc-100">Prepare Q2 roadmap draft</p>
                                    <span className="rounded-md bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
                                        Medium
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-400">Assigned to Jamie • Due tomorrow</p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 text-white bg-[#10162f] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium text-zinc-100">Review onboarding checklist</p>
                                    <span className="rounded-md bg-sky-500/15 px-2 py-1 text-xs text-sky-300">
                                        Low
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-400">Assigned to Taylor • Due Friday</p>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-2xl border bg-white dark:bg-zinc-900/70 p-5">
                        <h2 className="text-base font-semibold">Team Pulse</h2>
                        <p className="mt-1 text-sm">Current sprint health</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Velocity</span>
                                    <span>78%</span>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-800">
                                    <div className="h-2 w-[78%] rounded-full bg-emerald-400" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Focus Time</span>
                                    <span>64%</span>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-800">
                                    <div className="h-2 w-[64%] rounded-full bg-sky-400" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Risk</span>
                                    <span>21%</span>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-800">
                                    <div className="h-2 w-[21%] rounded-full bg-rose-400" />
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-2 dark:bg-zinc-900/70 text-[#1a1a29] dark:text-zinc-400">
                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-5">
                        <h2 className="text-base font-semibold">Status Breakdown</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">
                                <span>TODO</span>
                                <span className="font-medium 0">{todoCount} tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">                                <span >DOING</span>
                                <span className="font-medium text-zinc-100">{doingCount} tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">                                <span>DONE</span>
                                <span className="font-medium text-zinc-100">{doneCount} tasks</span>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-5">
                        <h2 className="text-base font-semibold">Recent Activity</h2>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">
                                <p className="text-sm">Morgan moved "API retries" to DONE</p>
                                <p className="mt-1 text-xs text-zinc-500">10 minutes ago</p>
                            </div>
                            <div className="rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">
                                <p className="text-sm">Avery created "Scope user exports"</p>
                                <p className="mt-1 text-xs text-zinc-500">32 minutes ago</p>
                            </div>
                            <div className="rounded-lg border border-zinc-800 text-white bg-[#10162f] px-3 py-2">
                                <p className="text-sm">Jordan commented on "SSO onboarding"</p>
                                <p className="mt-1 text-xs text-zinc-500">1 hour ago</p>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
