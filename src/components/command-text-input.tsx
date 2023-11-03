"use client";

import React, { useEffect, useRef } from "react";
import { RightChevron } from "./icons/right-chevron";
import { usePrompts } from "@/app/context/PromptContext";

type Props = {
  value: string;
  placeholder: string;
  expand?: boolean;
};

export default function CommandTextInput({
  value,
  placeholder,
  expand = true,
}: Props) {
  const { setActivePromptTemplate } = usePrompts();

  useEffect(() => {
    if (expand && textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 200 ? "auto" : "hidden"
      }`;
    }
  }, [value]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className="flex max-h-[200px] w-full cursor-text resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
      placeholder={placeholder}
    >
      <button onClick={() => setActivePromptTemplate(undefined)}>
        <RightChevron className="h-4 w-4 rotate-180 cursor-pointer fill-white" />
      </button>
    </div>
  );
}
