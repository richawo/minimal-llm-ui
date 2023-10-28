"use client";

import { useModal } from "@/app/context/ModalContext";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SavePromptModal() {

  const { setModalConfig } = useModal();

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
        className="fixed inset-0 bg-[#1c1737]/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          onClick={() => closeModal()}
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative transform flex flex-col overflow-hidden rounded-lg bg-gradient-to-r from-[#D06CFF] to-[#00109E] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl max-h-[80vh] p-0.5"
          >
            <div className="bg-black rounded-lg">
              <motion.div
                layout
                className="bg-gradient-to-b from-[#232228]/50 to-[#232228]/90 rounded-lg"
              >
                
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
