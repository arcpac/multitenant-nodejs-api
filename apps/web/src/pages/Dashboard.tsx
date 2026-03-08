import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useTheme } from "../theme/ThemeProvider";


const Dashboard = () => {
    const { isDark, setIsDark } = useTheme();
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
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 dark:bg-zinc-900/70 text-[#1a1a29] dark:text-zinc-400">
                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">Total Tasks</p>
                        <p className="mt-3 text-3xl font-semibold">24</p>
                        <p className="mt-2 text-xs text-emerald-300">+3 from yesterday</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">To Do</p>
                        <p className="mt-3 text-3xl font-semibold">10</p>
                        <p className="mt-2 text-xs text-zinc-400">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">In Progress</p>
                        <p className="mt-3 text-3xl font-semibold">10</p>
                        <p className="mt-2 text-xs text-zinc-400">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 shadow">
                        <p className="text-xs uppercase tracking-wide">Done</p>
                        <p className="mt-3 text-3xl font-semibold">6</p>
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
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <span className="text-zinc-300">TODO</span>
                                <span className="font-medium text-zinc-100">10 tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <span className="text-zinc-300">DOING</span>
                                <span className="font-medium text-zinc-100">8 tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <span className="text-zinc-300">DONE</span>
                                <span className="font-medium text-zinc-100">6 tasks</span>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-white dark:bg-zinc-900/70 p-5">
                        <h2 className="text-base font-semibold">Recent Activity</h2>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <p className="text-sm text-zinc-200">Morgan moved "API retries" to DONE</p>
                                <p className="mt-1 text-xs text-zinc-500">10 minutes ago</p>
                            </div>
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <p className="text-sm text-zinc-200">Avery created "Scope user exports"</p>
                                <p className="mt-1 text-xs text-zinc-500">32 minutes ago</p>
                            </div>
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                                <p className="text-sm text-zinc-200">Jordan commented on "SSO onboarding"</p>
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
