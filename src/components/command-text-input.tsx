"use client";

import { usePrompts } from "@/app/context/PromptContext";
import { useEffect, useRef, useState } from "react";
import ExpandingTextInput from "./expanding-text-input";
import { RightChevron } from "./icons/right-chevron";
import React from "react";

type Props = {
  placeholder: string;
  expand?: boolean;
};

export default function CommandTextInput({
  placeholder,
  expand = true,
}: Props) {
  const { activePromptTemplate, setActivePromptTemplate } = usePrompts();
  const [commandValues, setCommandValues] = useState<any>(); //base it on active prompt template
  const [resultArray, setResultArray] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<Map<string, string>>();
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      activePromptTemplate?.inputs &&
      activePromptTemplate.inputs?.length > 0
    ) {
      const im = new Map<string, string>([
        ...activePromptTemplate.inputs.map((x: string) => [
          x,
          "<" + x.substring(5) + ">",
        ]),
      ]);
      setInputValues(im);
    }
    console.log(activePromptTemplate);
    const inputs = [...activePromptTemplate?.inputs];
    const content: string = activePromptTemplate.content;
    const regex = /%var:[^ ,.?!\n]+|(%var:[^ ,.?!\n]+[ ,.?!\n])/g; // Regular expression to match %var: followed by any non-space characters
    const m: any[] = [...content.matchAll(regex)];
    const resArr: string[] = [];
    // if (m && m.length > 0 && activePromptTemplate.inputs.length > 0) {
    let i = 0;
    while (m.length > 0) {
      resArr.push(content.substring(i, m[0].index));
      i = m[0].index + m[0][0].length;
      resArr.push(content.substring(m[0].index, i));
      m.shift();
    }
    resArr.push(content.substring(i));
    console.log(resArr);
    setResultArray(resArr);
  }, [activePromptTemplate]);

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
        className="flex w-full flex-wrap gap-5 px-5 text-xs overflow-y-auto"
      >
        <div
          style={{ wordWrap: "break-word" }}
          className="list-item list-none whitespace-pre-line text-white"
        >
          {resultArray.map((x, i) => (
            <React.Fragment key={"prompt-input-" + i}>
              {activePromptTemplate.inputs.includes(x) ? (
                <span
                  suppressContentEditableWarning
                  onInput={(e) => {
                    setInputValues((prev) => {
                      const x2 = new Map<string, string>(prev);
                      x2?.set(x, (e.target as any).textContent);
                      console.log([...x2]);
                      return x2;
                    });
                  }}
                  contentEditable={true}
                  className="mx-1 rounded-md bg-white/10 px-1 py-0.5 underline"
                >
                  {"<" + x.substring(5) + ">"}
                </span>
              ) : (
                <span>{x}</span>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* {activePromptTemplate.inputs.map((x: string) => (
          <span
            className="flex min-w-[200px] grow items-center gap-x-2 rounded-md px-2 py-1"
            key={x}
          >
            <div className="font-bold h-4 text-white/50">{x}:</div>
            TODO: INSERT THE TEXT WITH THE VARS TO BE REPLACED??? (STYLED)
            <ExpandingTextInput
              className="max-h-[150px] p-2"
              onChange={(e) => {
                triggerResize;
                // find the command in the list based on the input (x) and then replace (use something like {input_key: value})
                if (e.target.value != "\n")
                  setCommandValues({ ...commandValues, [x]: e.target.value });
              }}
              value={commandValues?.[x] || ("" as string)}
              placeholder={x.slice(5) + ":"}
            ></ExpandingTextInput>
          </span>
        ))} */}
      </div>
    </div>
  );
}
