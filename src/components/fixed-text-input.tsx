"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  onInput?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  value: string;
  placeholder: string;
  height?: number | string;
};

export default function FixedTextInput({
  onInput,
  onKeyDown,
  value,
  placeholder,
  height,
}: Props) {
  const [initValue, setInitValue] = useState<string>(value);
  return (
    <div
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      style={{ height, wordWrap: "break-word" }}
      className="flex max-h-[200px] w-full cursor-text resize-none appearance-none flex-col overflow-scroll whitespace-pre-wrap rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
      placeholder={placeholder}
      content={value}
      defaultValue={value}
      suppressContentEditableWarning={true}
    >
      {initValue}
    </div>
  );
}
