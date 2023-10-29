"use client";

import { useModal } from "@/app/context/ModalContext";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import FixedTextInput from "../fixed-text-input";
import { cn } from "@/utils/cn";

export default function SavePromptModal() {
  const { modalConfig, setModalConfig } = useModal();
  const [content, setContent] = useState<string>(modalConfig.data.content);

  function closeModal() {
    setModalConfig({ modal: undefined, data: undefined });
  }

  function handleChange(value: string) {
    console.log(value, content);
    if (value != "\n") setContent(value);
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
              <motion.div
                layout
                className="flex flex-col gap-y-2 rounded-sm bg-black p-2 text-sm text-white"
              >
                <div>{"Save Prompt"}</div>
                <hr className="border-white/10" />
                <div>
                  <span className="text-white/50">
                    {"Prefix input variables with:"}
                  </span>
                  <code>%var:</code>
                </div>
                <FixedTextInput
                  onInput={(e) => handleChange(e.target.textContent)}
                  value={content}
                  placeholder={""}
                />
                <hr className="border-white/10" />
                <button
                  className={cn("rounded-sm px-2 py-1 text-black", {
                    "bg-white": content && content.length > 0,
                    "bg-white/50": content.length == 0,
                  })}
                >
                  {"Save"}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
