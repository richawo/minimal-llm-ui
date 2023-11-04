"use client";

import React, { useEffect, useRef, useState } from "react";
import { RightChevron } from "./icons/right-chevron";
import { usePrompts } from "@/app/context/PromptContext";
import ExpandingTextInput from "./expanding-text-input";

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
  const { activePromptTemplate, setActivePromptTemplate } = usePrompts();
  const [commandValues, setCommandValues] = useState<any>(); //base it on active prompt template
  const commandRef = useRef<HTMLDivElement>(null);

  function triggerResize() {
    if (expand && commandRef && commandRef.current) {
      commandRef.current.style.height = "inherit";
      commandRef.current.style.height = `${commandRef.current?.scrollHeight}px`;
      commandRef.current.style.overflow = `${
        commandRef?.current?.scrollHeight > 200 ? "auto" : "hidden"
      }`;
    }
  }

  return (
    <div
      className="flex max-h-[200px] w-full cursor-text resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
      placeholder={placeholder}
    >
      <button
        className="cursor-pointer rounded-md border border-white/10 px-0.5"
        onClick={() => setActivePromptTemplate(undefined)}
      >
        <RightChevron className="h-4 w-4 rotate-180 fill-white hover:fill-white" />
      </button>
      <div
        ref={commandRef}
        className="flex w-full flex-wrap gap-5 px-5 text-xs"
      >
        {activePromptTemplate.inputs.map((x: string) => (
          <span
            className="flex min-w-[200px] grow items-center gap-x-2 rounded-md px-2 py-1"
            key={x}
          >
            {/* <div className="font-bold h-4 text-white/50">{x}:</div> */}
            <ExpandingTextInput
              className="p-2 max-h-[150px]"
              onChange={(e) => {
                triggerResize;
                // find the command in the list based on the input (x) and then replace (use something like {input_key: value})
                if (e.target.value != "\n")
                  setCommandValues({ ...commandValues, [x]: e.target.value });
              }}
              value={commandValues?.[x] || "" as string}
              placeholder={x.slice(5) + ":"}
            ></ExpandingTextInput>
          </span>
        ))}
      </div>
    </div>
  );
}
