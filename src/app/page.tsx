"use client";
import generateRandomString, { cn } from "@/lib/utils";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage } from "langchain/schema";
import { useEffect, useState } from "react";

export default function Home() {
  const [newPrompt, setNewPrompt] = useState("");
  const [messages, setMessages] = useState<
    {
      type: string;
      id: any;
      timestamp: number;
      content: string;
      model?: string;
    }[]
  >([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [activeModel, setActiveModel] = useState<string>("");
  const [ollama, setOllama] = useState<ChatOllama>();

  // Get models
  useEffect(() => {
    fetch("http://localhost:11434/api/tags")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAvailableModels(data.models);
        console.log(data.models[0]?.name)
        setActiveModel(data.models[0]?.name);
        const initOllama = new ChatOllama({
          baseUrl: "http://localhost:11434",
          model: data.models[0]?.name,
        });      
        setOllama(initOllama)
      });
  }, []);


  async function triggerPrompt() {
    if (!ollama) return;
    const msg = {
      type: "human",
      id: generateRandomString(8),
      timestamp: Date.now(),
      content: newPrompt,
    };
    let streamedText = "";
    messages.push(msg);
    const msgCache = [...messages];
    const stream = await ollama.stream(
      messages.map((m) =>
        m.type == "human"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
    );
    setNewPrompt("");
    for await (const chunk of stream) {
      streamedText += chunk.content;
      const aiMsg = {
        type: "ai",
        id: generateRandomString(8),
        timestamp: Date.now(),
        content: streamedText,
      };
      const updatedMessages = [...msgCache, aiMsg];
      setMessages(() => updatedMessages);
    }
  }

  function toggleModel() {
    const i = (availableModels.findIndex(x => x.name == activeModel) + 1) % (availableModels.length - 1);
    setActiveModel(availableModels[i].name);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="flex h-full w-full grow flex-col items-center justify-end gap-y-4 whitespace-break-spaces">
        {messages.map((msg) => (
            <p
              key={"message-" + msg.id}
              className={cn(
                "flex h-fit cursor-pointer rounded-md border border-[#191919] px-2 py-1 text-sm text-white",
                { "ml-auto": msg.type == "human" },
                { "mr-auto": msg.type == "ai" },
              )}
            >
              {msg.content}
            </p>
        ))}
        <input
          onChange={(e) => {
            setNewPrompt(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.metaKey && !e.shiftKey && !e.altKey) {
              triggerPrompt();
            } else if (
              e.key === "Enter" &&
              (e.metaKey || !e.shiftKey || !e.altKey)
            ) {
              console.log(e);
            }
          }}
          className="block w-full appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
          placeholder="Send a message"
          type="text"
          value={newPrompt}
        ></input>
        <button className="text-xs text-white/50 cursor-pointer"  contentEditable={false} onClick={toggleModel}>{activeModel}</button>
      </div>
    </main>
  );
}
