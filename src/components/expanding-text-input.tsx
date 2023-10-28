"use client";

import React, { useRef } from "react";

type Props = {
  onChange?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  value: string;
  placeholder: string;
};

export default function ExpandingtextInput({
  onChange,
  onKeyDown,
  value,
  placeholder,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <textarea
      ref={textareaRef}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={1}
      className="flex max-h-[200px] w-full resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
      placeholder={placeholder}
      value={value}
    ></textarea>
  );
}
