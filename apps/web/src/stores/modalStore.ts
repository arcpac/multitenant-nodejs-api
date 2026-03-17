import { create } from "zustand";

export type ActiveModal =
    | null
    | { type: "create-task" }
    | { type: "delete-tasks"; taskIds: string[]; };

type ModalState = {
    activeModal: ActiveModal;
    open: (activeModal: Exclude<ActiveModal, null>) => void;
    close: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
    activeModal: null,
    open: (activeModal: ActiveModal) => {
        set({ activeModal });
    },
    close: () => {
        set({ activeModal: null });
    },
}));
