"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  onChange?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  value: string;
  placeholder: string;
  height?: number | string;
};

export default function FixedTextInput({
  onChange,
  onKeyDown,
  value,
  placeholder,
  height,
}: Props) {

  return (
    <div
      contentEditable={true}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{ height, wordWrap: "break-word" }}
      className="flex flex-col max-h-[200px] overflow-scroll w-full resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex whitespace-pre-wrap cursor-text"
      placeholder={placeholder}
    >
      {value}
    </div>
  );
}
