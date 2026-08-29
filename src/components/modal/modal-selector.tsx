"use client";

import { AppModal, useModal } from "@/app/context/ModalContext";
import SavePromptModal from "./save-prompt-modal";
import AddSystemInstructionModal from "./add-system-instruction-modal";
import EditSystemInstructionModal from "./edit-system-instruction-modal";

export default function ModalSelector() {
  const { modalConfig } = useModal();

  return (
    <>
      {modalConfig.modal == AppModal.SAVE_PROMPT && <SavePromptModal />}
      {modalConfig.modal == AppModal.ADD_SYSTEM_INSTRUCTION && <AddSystemInstructionModal />}
      {modalConfig.modal == AppModal.EDIT_SYSTEM_INSTRUCTION && <EditSystemInstructionModal />}
    </>
  );
}
