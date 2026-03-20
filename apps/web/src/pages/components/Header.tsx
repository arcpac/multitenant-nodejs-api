import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, type SubmitEventHandler, useState } from "react";
import { Link } from "react-router-dom";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { Dialog, Modal, ModalOverlay } from "../../components/application/modals/modal";
import { apiFetch } from "../../lib/api";
import { useTheme } from "../../theme/ThemeProvider";
import { toast } from 'sonner'
import { Select } from "@/components/base/select/select";


type TaskStatus = "TODO" | "DOING" | "DONE";
type TaskVisibility = "ORG_VISIBLE" | "PRIVATE";

const STATUS_ITEMS = [
    { id: "TODO", label: "To Do" },
    { id: "DOING", label: "Doing" },
    { id: "DONE", label: "Done" },
]

type CreateTaskInput = {
    title: string;
    description?: string;
    status: TaskStatus;
    visibility: TaskVisibility;
};

type CreateTaskResponse = {
    task: {
        id: string;
    };
};

const INITIAL_FORM_STATE: CreateTaskInput = {
    title: "",
    description: "",
    status: "TODO",
    visibility: "ORG_VISIBLE",
};

const Header = () => {
    const { isDark, setIsDark } = useTheme();
    const queryClient = useQueryClient();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setFormState(INITIAL_FORM_STATE);
        createTaskMutation.reset();
    };

    const createTaskMutation = useMutation({
        mutationFn: async (payload: CreateTaskInput) =>
            apiFetch<CreateTaskResponse>("/tasks", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["dashboardData"] }),
                queryClient.invalidateQueries({ queryKey: ["boardTasks"] }),
            ]);
            toast.success("Task created successfully");

            closeTaskModal();
        },
    });

    const handleFieldChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setFormState((current) => ({
            ...current,
            [name]: value,
        }));
    };
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const title = formState.title.trim();
        if (!title) return;

        createTaskMutation.mutate({
            title,
            description: formState.description?.trim() || undefined,
            status: formState.status,
            visibility: formState.visibility,
        });
    };

    return (
        <>
            <section className="relative overflow-hidden bg-white p-6 dark:bg-zinc-950 border-b border-[#dcdbe0]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
                <div className="relative flex flex-col gap-4 text-[#1a1a29] dark:text-zinc-400 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em]">TeamBoard</p>
                        <Link to={'/dashboard'}>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
                        </Link>
                        <p className="mt-2 max-w-2xl text-sm">
                            A quick snapshot of team execution for today.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setIsTaskModalOpen(true)}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
                        >
                            New Task
                        </button>
                        <Link
                            to="/board"
                            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
                        >
                            Open Board
                        </Link>
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

            <ModalOverlay
                isOpen={isTaskModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeTaskModal();
                        return;
                    }

                    setIsTaskModalOpen(true);
                }}
                isDismissable
            >
                <Modal className="w-full max-w-xl">
                    <Dialog
                        aria-label="Create a new task"
                        className="flex flex-col w-full p-5 overflow-hidden rounded-md border border-black bg-white shadow-2xl"
                    >
                        {/* form header */}
                        <div className="w-full border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                                        Create a task
                                    </h2>
                                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        Team assignment and assignee can be added later.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeTaskModal}
                                    className="rounded-full border border-zinc-200 p-2 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                                    aria-label="Close create task modal"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* content / form */}
                        <form onSubmit={handleSubmit} className="w-full px-6">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                    Title
                                </span>
                                <input
                                    name="title"
                                    value={formState.title}
                                    onChange={handleFieldChange}
                                    placeholder="Ship billing retry fix"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                                    required
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                    Description
                                </span>
                                <textarea
                                    name="description"
                                    value={formState.description}
                                    onChange={handleFieldChange}
                                    placeholder="Add the context, expected outcome, or blockers."
                                    rows={4}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block space-y-2">
                                    <Select
                                        isRequired
                                        size="sm"
                                        label="Task Status"
                                        tooltip="This is a tooltip"
                                        hint="This is a hint text to help user."
                                        placeholder="Select team member"
                                        items={STATUS_ITEMS}
                                    >
                                        {(item) => (
                                            <Select.Item
                                                id={item.id}
                                                supportingText={item.supportingText}
                                                isDisabled={item.isDisabled}
                                                icon={item.icon}
                                                avatarUrl={item.avatarUrl}
                                                className="[&_[slot='description']]:text-sm [&_[slot='label']]:text-sm"
                                            >
                                                {item.label}
                                            </Select.Item>
                                        )}
                                    </Select>
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                        Visibility
                                    </span>
                                    <select
                                        name="visibility"
                                        value={formState.visibility}
                                        onChange={handleFieldChange}
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                                    >
                                        <option value="ORG_VISIBLE">Org visible</option>
                                        <option value="PRIVATE">Private</option>
                                    </select>
                                </label>
                            </div>

                            {createTaskMutation.error && (
                                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                                    {createTaskMutation.error.message}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeTaskModal}
                                    className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTaskMutation.isPending || !formState.title.trim()}
                                    className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                                >
                                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
};

export default Header;
