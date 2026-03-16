import { Checkbox } from "@/components/base/checkbox/checkbox";
import { useDraggable } from "@dnd-kit/react";

type TaskItemTask = {
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

type TaskItemProps = {
    task: TaskItemTask;
    dueDate: string | null;
    editMode: boolean;
    isSelected: boolean;
    onSelectTask: (taskId: string) => void;
};

const PRIORITY_STYLES: Record<TaskItemTask["priority"], string> = {
    LOW: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    HIGH: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    URGENT: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
};

function getAssigneeName(task: TaskItemTask) {
    if (!task.assignee) return "Unassigned";

    const fullName = [task.assignee.firstName, task.assignee.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || task.assignee.email;
}

const TaskItem = ({ task, dueDate, editMode, isSelected, onSelectTask }: TaskItemProps) => {
    const { ref } = useDraggable({
        id: task.id,
    });
    return (
        <article className="rounded-2xl bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" ref={ref}>
            {editMode && (
                <div className="flex w-full justify-end pb-1">
                    <Checkbox
                        size="sm"
                        isSelected={isSelected}
                        onChange={() => onSelectTask(task.id)}
                        aria-label={`Select ${task.title}`}
                    />
                </div>
            )}

            <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {task.title}
                </p>
                <span
                    className={`rounded-md px-1 py-1 text-[11px] font-semibold ${PRIORITY_STYLES[task.priority]}`}
                >
                    {task.priority}
                </span>
            </div>

            <div className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <p>{getAssigneeName(task)}</p>
                {task.team?.name && <p>{task.team.name}</p>}
                {dueDate && <p>Due {dueDate}</p>}
            </div>
        </article>
    );
};

export default TaskItem;
