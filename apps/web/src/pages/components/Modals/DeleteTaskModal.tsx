import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { useModalStore } from "@/stores/modalStore";
import { Loading01 } from "@untitledui/icons";

type DeleteTaskModalProps = {
  isPending: boolean;
  onConfirm: (taskIds: string[]) => void;
};

const DeleteTaskModal = ({ isPending, onConfirm }: DeleteTaskModalProps) => {
  const activeModal = useModalStore((s) => s.activeModal);
  const closeModal = useModalStore((s) => s.close);

  const isOpen = activeModal?.type === "delete-tasks" && activeModal.taskIds.length > 0;
  const taskIds = isOpen ? activeModal.taskIds : [];
  const taskCount = taskIds.length;

  const handleConfirm = () => {
    if (!isOpen || taskCount === 0 || isPending) return;
    onConfirm(taskIds);
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(nextIsOpen) => {
        if (!nextIsOpen) {
          closeModal();
        }
      }}
      isDismissable={!isPending}
    >
      <Modal className="w-full max-w-md">
        <Dialog
          aria-label="Delete selected tasks"
          className="flex w-full flex-col overflow-hidden rounded-2xl border border-black bg-white p-5 shadow-2xl"
        >
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Delete {taskCount} task{taskCount === 1 ? "" : "s"}?
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                This action cannot be undone. The selected task
                {taskCount === 1 ? "" : "s"} will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending || taskCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {isPending ? (
                  <>
                    <Loading01 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  `Delete ${taskCount} task${taskCount === 1 ? "" : "s"}`
                )}
              </button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default DeleteTaskModal;
