import { useQuery } from '@tanstack/react-query';
import { gqlFetch } from '../lib/graphql';
import Header from './components/Header';
import { Loading01 } from '@untitledui/icons';

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
    const { data: dashboardData, isLoading } = useQuery({
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
        <div className="min-h-screen bg-amber-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <Header
                />
                <section className="mt-6 grid gap-4 text-zinc-900 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-black bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide">Total Tasks</p>
                        <p className="mt-3 text-3xl font-semibold">{isLoading ? <Loading01 className="inline-block h-8 w-8 animate-spin text-amber-600" />
                            : totalCount}</p>
                        <p className="mt-2 text-xs text-emerald-600">+3 from yesterday</p>
                    </article>

                    <article className="rounded-2xl border bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide">To Do</p>
                        <p className="mt-3 text-3xl font-semibold">{isLoading ? <Loading01 className="inline-block h-8 w-8 animate-spin text-amber-600" /> : todoCount}</p>
                        <p className="mt-2 text-xs text-zinc-500">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border 0 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide">In Progress</p>
                        <p className="mt-3 text-3xl font-semibold">{isLoading ? <Loading01 className="inline-block h-8 w-8 animate-spin text-amber-600" /> : doingCount}</p>
                        <p className="mt-2 text-xs text-zinc-500">Needs planning</p>
                    </article>

                    <article className="rounded-2xl border 0 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide">Done</p>
                        <p className="mt-3 text-3xl font-semibold">{isLoading ? <Loading01 className="inline-block h-8 w-8 animate-spin text-amber-600" /> : doneCount}</p>
                        <p className="mt-2 text-xs text-emerald-600">25% completion rate</p>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 text-zinc-900 lg:grid-cols-3">
                    <article className="rounded-2xl border 0 bg-white p-5 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Priority Tasks</h2>
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                                3 urgent
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">Ship billing bug fix</p>
                                    <span className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700">
                                        High
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-600">Assigned to Alex • Due today</p>
                            </div>

                            <div className="rounded-xl border 0 bg-amber-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">Prepare Q2 roadmap draft</p>
                                    <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700">
                                        Medium
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-600">Assigned to Jamie • Due tomorrow</p>
                            </div>

                            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">Review onboarding checklist</p>
                                    <span className="rounded-md bg-sky-100 px-2 py-1 text-xs text-sky-700">
                                        Low
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-600">Assigned to Taylor • Due Friday</p>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-2xl border 0 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold">Team Pulse</h2>
                        <p className="mt-1 text-sm text-zinc-600">Current sprint health</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Velocity</span>
                                    <span>78%</span>
                                </div>
                                <div className="h-2 rounded-full bg-amber-100">
                                    <div className="h-2 w-[78%] rounded-full bg-emerald-400" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Focus Time</span>
                                    <span>64%</span>
                                </div>
                                <div className="h-2 rounded-full bg-amber-100">
                                    <div className="h-2 w-[64%] rounded-full bg-sky-400" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Risk</span>
                                    <span>21%</span>
                                </div>
                                <div className="h-2 rounded-full bg-amber-100">
                                    <div className="h-2 w-[21%] rounded-full bg-rose-400" />
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 text-zinc-900 lg:grid-cols-2">
                    <article className="rounded-2xl border 0 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold">Status Breakdown</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-lg border 0 bg-amber-50 px-3 py-2">
                                <span>TODO</span>
                                <span className="font-medium">{todoCount} tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border 0 bg-amber-50 px-3 py-2">
                                <span>DOING</span>
                                <span className="font-medium">{doingCount} tasks</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border 0 bg-amber-50 px-3 py-2">
                                <span>DONE</span>
                                <span className="font-medium">{doneCount} tasks</span>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-2xl border 0 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold">Recent Activity</h2>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg border 0 bg-amber-50 px-3 py-2">
                                <p className="text-sm">Morgan moved "API retries" to DONE</p>
                                <p className="mt-1 text-xs text-zinc-500">10 minutes ago</p>
                            </div>
                            <div className="rounded-lg border 0 bg-amber-50 px-3 py-2">
                                <p className="text-sm">Avery created "Scope user exports"</p>
                                <p className="mt-1 text-xs text-zinc-500">32 minutes ago</p>
                            </div>
                            <div className="rounded-lg border 0 bg-amber-50 px-3 py-2">
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
