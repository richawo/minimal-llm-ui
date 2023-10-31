"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  onChange?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  value: string;
  placeholder: string;
  expand?: boolean;
};

export default function ExpandingTextInput({
  onChange,
  onKeyDown,
  value,
  placeholder,
  expand = true,
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
      className="flex max-h-[200px] w-full resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex cursor-text"
      placeholder={placeholder}
      value={value} 
    ></textarea>
  );
}
