"use client";

import { useModal } from "@/app/context/ModalContext";
import { motion } from "framer-motion";

export default function SavePromptModal() {
  const { modalConfig, setModalConfig } = useModal();

  function closeModal() {
    setModalConfig({ modal: undefined, data: undefined });
  }
  const bgVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="relative z-[9999]">
      <motion.div
        variants={bgVariant}
        initial={"hidden"}
        animate={"visible"}
        exit={"hidden"}
        className="fixed inset-0 bg-[#000000]/20 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          onClick={() => closeModal()}
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/black relative flex max-h-[80vh] transform flex-col overflow-hidden rounded-sm border border-white/20 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl"
          >
            <div className="rounded-sm bg-black">
              <motion.div layout className="rounded-sm bg-black text-white text-sm flex flex-col gap-y-2 p-2">
                <div>{"Save Prompt"}</div>
                <hr className="border-white/10" />
                <div >{JSON.stringify(modalConfig.data.content)}</div>
                <hr className="border-white/10" />
                <div>
                  {"Do you want to save your chat?"}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
