"use client";
import { ChatOllama } from "langchain/chat_models/ollama";
import { useState } from "react";

export default function Home() {
  const [newPrompt, setNewPrompt] = useState("");
  const [text, setText] = useState("");

  const ollama = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "zephyr",
  });

  async function triggerPrompt() {
      const stream = await ollama.stream(newPrompt);
      setNewPrompt("");
      for await (const chunk of stream) {
        console.log(chunk);
        setText((prev) => prev + chunk.content);
      }
    }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="flex grow w-full h-full flex-col justify-end items-center">
        {/* <button onClick={() => triggerPrompt()}>Click me</button> */}
        <p className="mt-8 flex h-full grow text-sm text-white">{text}</p>
        <input
        // on change, set the new prompt to the value of the input field but if they press enter, trigger the prompt
          onChange={(e) => {setNewPrompt(e.target.value); (e as any).key === "Enter" && triggerPrompt()}}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              // Call your function here
              triggerPrompt();
            }
          }}

          id="search"
          className="block w-full appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
          placeholder="Where to travel next year"
          type="text"
          value={newPrompt}
        ></input>
      </div>
    </main>
  );
}
