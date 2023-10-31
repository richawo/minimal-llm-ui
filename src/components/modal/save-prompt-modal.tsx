"use client";

import { useModal } from "@/app/context/ModalContext";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import FixedTextInput from "../fixed-text-input";

export default function SavePromptModal() {
  const { modalConfig, setModalConfig } = useModal();
  const [content, setContent] = useState<string>(modalConfig.data.content);
  const [matchedText, setMatchedText] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptName, setPromptName] = useState<string>("");

  function closeModal() {
    setModalConfig({ modal: undefined, data: undefined });
  }

  function toggleCopied() {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleChange(value: string) {
    console.log(value, content);
    if (value != "\n") setContent(value);
    const regex = /%var:[^ ,.?!\n]+|(%var:[^ ,.?!\n]+[ ,.?!\n])/g; // Regular expression to match %var: followed by any non-space characters

    const arr: string[] = [];
    const matched = value.matchAll(regex);
    (matched as any).forEach((x: any) => {
      if (!arr.includes(x[0])) arr.push(x[0]);
    });
    setContent(value);
    setMatchedText(arr);
    console.log(value.matchAll(regex));
  }

  function savePromptName(value: string) {
    if (value != "\n") setPromptName(value);
  }

  useEffect(() => {
    setContent(modalConfig.data.content);
  }, [modalConfig.data.content]);

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
                  <code
                    className="cursor-pointer hover:bg-white/20"
                    onClick={() => {
                      navigator.clipboard.writeText("%var:");
                      toggleCopied();
                    }}
                  >
                    %var:
                  </code>
                  {copied && (
                    <span className="ml-2 rounded-sm bg-green-400/10 px-2 py-1 text-xs font-semibold text-green-400">
                      {"Copied"}
                    </span>
                  )}
                </div>
                <FixedTextInput
                  onInput={(e) => handleChange(e.target.textContent)}
                  value={content}
                  placeholder={""}
                />
                <div className="flex flex-wrap gap-2">
                  {matchedText.map((x) => (
                    <div
                      key={x}
                      className="bg-blue-400/10 px-2 py-1 text-xs text-blue-400"
                    >
                      {x}
                    </div>
                  ))}
                </div>
                <hr className="border-white/10" />
                <FixedTextInput
                  onInput={(e) => savePromptName(e.target.textContent)}
                  value={promptName}
                  placeholder={"Enter Prompt Name..."}
                  height={50}
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
