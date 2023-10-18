"use client";
import { Ollama } from "langchain/llms/ollama";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "zephyr",
  });

  async function triggerPrompt() {
    const stream = await ollama.stream("who is oliver twist?");

    for await (const chunk of stream) {
      // process.stdout.write(chunk);
      console.log(chunk);
      setText((prev) => prev + chunk);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="flex w-full flex-col items-center justify-center">
        <button onClick={() => triggerPrompt()}>Click me</button>
        <div className="h-full w-full flex-col"></div>
        <input
          onChange={(e) => console.log(e.target.value)}
          id="search"
          className="lg:text-md block w-full appearance-none rounded-md border-0 bg-[#2D2C37]/20 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex xl:text-lg"
          placeholder="Where to travel next year"
          type="text"
          value=""
        ></input>
        <p className="mt-8 flex text-sm text-white">{text}</p>
      </div>
    </main>
  );
}
