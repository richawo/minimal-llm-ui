"use client";

import { AppModal, useModal } from "@/app/context/ModalContext";
import { useSystemInstruction } from "@/app/context/SystemInstructionContext";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ExpandingTextInput from "../expanding-text-input";

export default function EditSystemInstructionModal() {
  const { updateExistingSystemInstruction } = useSystemInstruction();
  const { modalConfig, setModalConfig } = useModal();
  const [content, setContent] = useState<string>("");
  const [instructionName, setInstructionName] = useState<string>("");
  const [instructionId, setInstructionId] = useState<string>("");

  // Load the instruction data when the modal is opened
  useEffect(() => {
    if (modalConfig.data && modalConfig.modal === AppModal.EDIT_SYSTEM_INSTRUCTION) {
      setInstructionId(modalConfig.data.id);
      setInstructionName(modalConfig.data.name);
      setContent(modalConfig.data.content);
    }
  }, [modalConfig]);

  function closeModal() {
    setModalConfig({ modal: undefined, data: undefined });
  }

  function handleContentChange(e: any) {
    setContent(e.target.value);
  }

  const saveInstructionName = (e: any) => {
    const value = e.target.value;
    setInstructionName(value);
  };

  function saveInstruction() {
    if (instructionName && content && instructionId) {
      updateExistingSystemInstruction(instructionId, instructionName, content);
      closeModal();
    }
  }

  const bgVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
  };

  return (
    <div className="relative z-[9999]">
      <motion.div
        variants={bgVariant}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            variants={modalVariant}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit System Instruction
                </h3>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Instruction Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruction Name
                  </label>
                  <input
                    type="text"
                    value={instructionName}
                    onChange={saveInstructionName}
                    placeholder="Enter instruction name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01a982] focus:border-[#01a982] transition-colors"
                  />
                </div>

                {/* Instruction Content Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruction Content
                  </label>
                  <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Enter system instruction content..."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01a982] focus:border-[#01a982] transition-colors resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {content.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!content || content.length === 0 || instructionName.length === 0}
                  onClick={saveInstruction}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    content && content.length > 0 && instructionName.length > 0
                      ? "bg-[#01a982] text-white hover:bg-[#00896a]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}