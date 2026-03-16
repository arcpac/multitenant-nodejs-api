import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "./components/Header";
import BoardColumn from "./components/BoardColumn";
import { gqlFetch } from "../lib/graphql";
import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { DragDropProvider } from "@dnd-kit/react";

type TaskStatus = "TODO" | "DOING" | "DONE";
type BatchDeleteTasksResponse = {
    deletedCount: number;
    deletedIds: string[];
    missingIds: string[];
    forbiddenIds: string[];
};

type UpdateTaskResponse = {
    task: BoardTask;
};

type UpdateTaskStatusInput = {
    taskId: string;
    status: TaskStatus;
};

const boardTasksQueryKey = ["boardTasks", { teamId: null }] as const;

type BoardTask = {
    id: string;
    title: string;
    status: TaskStatus;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: string | null;
    assignee: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    team: {
        name: string;
    } | null;
};

const TASKS_QUERY = `
query BoardTasks($teamId: ID) {
  tasks(filter: { teamId: $teamId }) {
    id
    title
    status
    priority
    dueDate
    assignee {
      firstName
      lastName
      email
    }
    team {
      name
    }
  }
}
`;

const COLUMN_ORDER: TaskStatus[] = ["TODO", "DOING", "DONE"];

const COLUMN_LABELS: Record<TaskStatus, string> = {
    TODO: "To Do",
    DOING: "Doing",
    DONE: "Done",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
});

function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;
    return dateFormatter.format(new Date(dueDate));
}

const Board = () => {
    const queryClient = useQueryClient();
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])
    const [editMode, setEditMode] = useState<boolean>(false);

    const { data: tasks = [] } = useQuery({
        queryKey: ["boardTasks", { teamId: null }],
        queryFn: async () => {
            const data = await gqlFetch<{ tasks: BoardTask[] }>(TASKS_QUERY, {
                teamId: null,
            });
            return data.tasks;
        },
        staleTime: 60_000,
        gcTime: 300_000,
    });

    const tasksByStatus = COLUMN_ORDER.reduce<Record<TaskStatus, BoardTask[]>>(
        (acc, status) => {
            acc[status] = tasks.filter((task) => task.status === status);
            return acc;
        },
        {
            TODO: [],
            DOING: [],
            DONE: [],
        }
    );

    const handleSelectTask = useCallback((taskId: string) => {
        setSelectedTasks((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        )
    }, [])

    const deleteTasksMutation = useMutation({
        mutationFn: (taskIds: string[]) =>
            apiFetch<BatchDeleteTasksResponse>("/tasks/delete-many", {
                method: "POST",
                body: JSON.stringify({ taskIds }),
            }),
        onSuccess: async (result) => {
            queryClient.setQueryData<BoardTask[]>(boardTasksQueryKey, (current = []) =>
                current.filter((task) => !result.deletedIds.includes(task.id))
            );

            setSelectedTasks((current) =>
                current.filter((id) => !result.deletedIds.includes(id))
            );

            await queryClient.invalidateQueries({ queryKey: ["dashboardData"] });

            if (result.forbiddenIds.length > 0 || result.missingIds.length > 0) {
                toast.warning(
                    `Deleted ${result.deletedCount} tasks. Some could not be removed.`
                );
                return;
            }

            toast.success(`Deleted ${result.deletedCount} task${result.deletedCount === 1 ? "" : "s"}`);
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to delete tasks");
        },
    });

    const updateTaskStatus = useMutation({
        mutationFn: ({ taskId, status }: UpdateTaskStatusInput) =>
            apiFetch<UpdateTaskResponse>(`/tasks/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }),

        onMutate: async ({ taskId, status }) => {
            await queryClient.cancelQueries({ queryKey: ['boardTasks', { teamId: null }] }); // stop in transit

            const previousTasks =
                queryClient.getQueryData<BoardTask[]>(boardTasksQueryKey) ?? []; // get current cached data

            queryClient.setQueryData<BoardTask[]>(boardTasksQueryKey, (current = []) =>
                current.map((task) =>
                    task.id === taskId ? { ...task, status } : task
                )
            );

            return { previousTasks };
        },

        onError: (error, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(boardTasksQueryKey, context.previousTasks);
            }

            toast.error(error instanceof Error ? error.message : "Failed to update task status");
        },

        onSuccess: ({ task }) => {
            queryClient.setQueryData<BoardTask[]>(boardTasksQueryKey, (current = []) =>
                current.map((currentTask) =>
                    currentTask.id === task.id ? task : currentTask
                )
            );
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: boardTasksQueryKey });
            await queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
        },
    });


    const toggleEditMode = () => {
        setEditMode((prev) => !prev)
    }

    const handleChangeStatus = (newStatus?: string | number | null, taskId?: string | number | null) => {
        if (typeof taskId !== "string" || typeof newStatus !== "string") return;
        if (!COLUMN_ORDER.includes(newStatus as TaskStatus)) return;

        const currentTask = tasks.find((task) => task.id === taskId);
        if (!currentTask || currentTask.status === newStatus) return;

        updateTaskStatus.mutate({ taskId, status: newStatus as TaskStatus });
    };

    const handleDeleteTasks = () => {
        if (selectedTasks.length === 0 || deleteTasksMutation.isPending) return;

        debugger
        deleteTasksMutation.mutate(selectedTasks);
    };

    return (
        <div className="min-h-screen bg-amber-50 py-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <Header />
                <section className="mx-auto flex w-full max-w-6xl flex-col bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">Board</h2>
                        <div>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                {tasks.length} tasks
                            </span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 px-1 underline" onClick={() => toggleEditMode()}>
                                Edit tasks
                            </span>
                            {selectedTasks.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDeleteTasks}
                                    disabled={deleteTasksMutation.isPending}
                                    className="px-1 text-sm text-red-500 underline disabled:opacity-50"
                                >
                                    {deleteTasksMutation.isPending ? "Deleting..." : `Delete (${selectedTasks.length})`}
                                </button>
                            )}
                        </div>
                    </div>
                    <DragDropProvider
                        onDragEnd={(event) => {

                            handleChangeStatus(
                                event.operation.target?.id,
                                event.operation.source?.id
                            );
                        }}
                    >
                        <div className="mt-4 grid flex-1 gap-4 md:grid-cols-3">
                            {COLUMN_ORDER.map((status) => {
                                console.log('tasksByStatus[status]: ', tasksByStatus[status])
                                return (
                                    <BoardColumn
                                        key={status}
                                        columnId={status}
                                        label={COLUMN_LABELS[status]}
                                        tasks={tasksByStatus[status]}
                                        editMode={editMode}
                                        selectedTaskIds={selectedTasks}
                                        onSelectTask={handleSelectTask}
                                        formatDueDate={formatDueDate}
                                    />
                                )
                            }

                            )
                            }
                        </div>
                    </DragDropProvider>
                </section>
            </div>
        </div>
    );
};

export default Board;
