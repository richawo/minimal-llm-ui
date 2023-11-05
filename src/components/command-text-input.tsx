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
  const [resultArray, setResultArray] = useState<{ v: string; i?: boolean }[]>(
    [],
  );
  const [initResultArray, setInitResultArray] = useState<
    { v: string; i?: boolean }[]
  >([]);
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
          x
          // "<" + x.substring(5) + ">",
        ]),
      ]);
      setInputValues(im);
    }
    console.log(activePromptTemplate);
    const inputs = [...activePromptTemplate?.inputs];
    const content: string = activePromptTemplate.content;
    const regex = /%var:[^ ,.?!\n]+|(%var:[^ ,.?!\n]+[ ,.?!\n])/g; // Regular expression to match %var: followed by any non-space characters
    const m: any[] = [...content.matchAll(regex)];
    const resArr: { v: string; i?: boolean }[] = [];
    // if (m && m.length > 0 && activePromptTemplate.inputs.length > 0) {
    let i = 0;
    while (m.length > 0) {
      resArr.push({ v: content.substring(i, m[0].index), i: false });
      i = m[0].index + m[0][0].length;
      resArr.push({ v: content.substring(m[0].index, i), i: true });
      m.shift();
    }
    resArr.push({ v: content.substring(i), i: false });
    console.log(resArr);
    setResultArray(resArr);
    setInitResultArray(resArr);
  }, [activePromptTemplate]);

  useEffect(() => {
    if (initResultArray && initResultArray.length > 0) {
      setResultArray([
        ...initResultArray.map((x: { v: string; i?: boolean }) => {
          console.log({
            v:
              inputValues?.get(x.v) ||
              // (inputValues?.get(x.v) &&
                // "%var:" + inputValues?.get(x.v)?.slice(1, -1)) ||
              x.v,
            i: x.i,
          });
          return {
            v:
            inputValues?.get(x.v) ||
              // (inputValues?.get(x.v) &&
              //   "%var:" + inputValues?.get(x.v)?.slice(1, -1)) ||
              x.v,
            i: x.i,
          };
        }),
      ]);
    }
  }, [inputValues]);

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
        className="flex w-full flex-wrap gap-5 overflow-y-auto px-5 text-xs"
      >
        <div
          style={{ wordWrap: "break-word" }}
          className="list-item list-none whitespace-pre-line text-white"
        >
          {resultArray.map((x, i) => (
            <React.Fragment key={"prompt-input-" + i + initResultArray[i].v}>
              {x.i ? (
                <span
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    setInputValues((prev) => {
                      const x2 = new Map<string, string>(prev);
                      x2?.set( initResultArray[i].v, (e.target as any).textContent);
                      console.log([...x2]);
                      return x2;
                    });
                  }}
                  
                  contentEditable={true}
                  className="mx-1 rounded-md bg-white/10 px-1 py-0.5 underline"
                >
                  {x.v}
                </span>
              ) : (
                <span>{x.v}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
