"use client";

import { cn } from "@/utils/cn";
import React, { useEffect, useRef } from "react";

type Props = {
  onChange?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  value: string;
  placeholder: string;
  expand?: boolean;
  className?: string;
};

export default function ExpandingTextInput({
  onChange,
  onKeyDown,
  value,
  placeholder,
  expand = true,
  className,
}: Props) {
  
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
    <textarea
      ref={textareaRef}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={1}
      className={cn(
        "flex max-h-[200px] w-full cursor-text resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex",
        className,
      )}
      placeholder={placeholder}
      value={value}
    ></textarea>
  );
}
