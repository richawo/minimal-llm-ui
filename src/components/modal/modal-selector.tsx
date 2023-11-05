"use client";

import { AppModal, useModal } from "@/app/context/ModalContext";
import SavePromptModal from "./save-prompt-modal";

export default function ModalSelector() {
  const { modalConfig } = useModal();

  return (
    <>
      {modalConfig.modal == AppModal.SAVE_PROMPT && <SavePromptModal />}
    </>
  );
}
