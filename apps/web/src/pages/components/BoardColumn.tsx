import { useDroppable } from "@dnd-kit/react";
import TaskItem from "./TaskItem";
import { Loading02 } from "@untitledui/icons";

type BoardColumnTask = {
    id: string;
    title: string;
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

type BoardColumnProps = {
    columnId: string;
    label: string;
    tasks: BoardColumnTask[];
    editMode: boolean;
    selectedTaskIds: string[];
    isLoading: boolean;
    onSelectTask: (taskId: string) => void;
    formatDueDate: (dueDate: string | null) => string | null;
};

const BoardColumn = ({
    columnId,
    label,
    tasks,
    editMode,
    selectedTaskIds,
    isLoading,
    onSelectTask,
    formatDueDate,
}: BoardColumnProps) => {
    const { ref } = useDroppable({
        id: columnId,
    });
    return (
        <div className="rounded-2xl bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">
                    {label}
                </h3>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    {tasks.length}
                </span>
            </div>

            <div ref={ref} className="h-full">
                <div className="mt-4 space-y-3">
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            dueDate={formatDueDate(task.dueDate)}
                            editMode={editMode}
                            isSelected={selectedTaskIds.includes(task.id)}
                            onSelectTask={onSelectTask}
                        />
                    ))}

                    {tasks.length === 0 && !isLoading ? (
                        <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                            No tasks
                        </div>
                    ) : isLoading && (<div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                        <Loading02 className="inline-block h-8 w-8 animate-spin text-amber-600" />
                    </div>)}
                </div>
            </div>
        </div>
    );
};

export default BoardColumn;
