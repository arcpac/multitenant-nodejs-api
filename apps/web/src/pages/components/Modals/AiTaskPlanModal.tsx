import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Loading01, Trash03 } from "@untitledui/icons";

export type AITaskDraft = {
  title: string;
  description: string;
};

type AITaskPlanModalProps = {
  isOpen: boolean;
  goal: string;
  tasks: AITaskDraft[];
  isPlanning: boolean;
  isSaving: boolean;
  onClose: () => void;
  onGoalChange: (value: string) => void;
  onGenerate: () => void;
  onTaskChange: (index: number, field: keyof AITaskDraft, value: string) => void;
  onRemoveTask: (index: number) => void;
  onSave: () => void;
};

const AITaskPlanModal = ({
  isOpen,
  goal,
  tasks,
  isPlanning,
  isSaving,
  onClose,
  onGoalChange,
  onGenerate,
  onTaskChange,
  onRemoveTask,
  onSave,
}: AITaskPlanModalProps) => {
  const trimmedGoal = goal.trim();
  const canGenerate = trimmedGoal.length >= 3 && !isPlanning && !isSaving;
  const canSave = tasks.length > 0 && tasks.every((task) => task.title.trim().length > 0) && !isPlanning && !isSaving;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(nextIsOpen) => {
        if (!nextIsOpen && !isPlanning && !isSaving) {
          onClose();
        }
      }}
      isDismissable={!isPlanning && !isSaving}
    >
      <Modal className="w-full max-w-3xl">
        <Dialog
          aria-label="Generate tasks with AI"
          className="flex w-full flex-col overflow-hidden rounded-2xl border border-black bg-white p-5 shadow-2xl"
        >
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Plan Tasks With AI</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Describe the goal, review the draft, then save only the tasks you want.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPlanning || isSaving}
                className="rounded-full border border-zinc-300 p-2 text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close AI task planner"
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

            <div className="rounded-2xl border border-black bg-amber-50 p-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-700">Goal</span>
                <textarea
                  value={goal}
                  onChange={(event) => onGoalChange(event.target.value)}
                  rows={1}
                  placeholder="Make a pizza for movie night"
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </label>

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={!canGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPlanning ? (
                    <>
                      <Loading01 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Draft"
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Draft Tasks
                </h3>
                <span className="text-sm text-zinc-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
              </div>

              {tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
                  Generate a draft to review tasks here.
                </div>
              ) : (
                <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
                  {tasks.map((task, index) => (
                    <div key={`${index}-${task.title}`} className="rounded-2xl border border-black bg-amber-50 p-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-700">Task {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveTask(index)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash03 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 space-y-3">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-zinc-700">Title</span>
                          <input
                            value={task.title}
                            onChange={(event) => onTaskChange(index, "title", event.target.value)}
                            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                          />
                        </label>

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-zinc-700">Description</span>
                          <textarea
                            value={task.description}
                            onChange={(event) => onTaskChange(index, "description", event.target.value)}
                            rows={3}
                            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPlanning || isSaving}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={!canSave}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loading01 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Create ${tasks.length} task${tasks.length === 1 ? "" : "s"}`
                )}
              </button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default AITaskPlanModal;
