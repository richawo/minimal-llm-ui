"use client";
import generateRandomString from "@/utils/generateRandomString";
import { cn } from "@/utils/cn";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage } from "langchain/schema";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RefreshIcon } from "@/components/icons/refresh-icon";
import { CopyIcon } from "@/components/icons/copy-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import AppNavbar from "@/components/app-navbar";
import { MenuToggle } from "@/components/menu-toggle";
import { motion, useCycle } from "framer-motion";

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
  const [conversations, setConversations] = useState<
    { title: string; filePath: string }[]
  >([]);
  const [activeConversation, setActiveConversation] = useState<string>("");
  const [menuState, toggleMenuState] = useCycle(false, true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      // textareaRef.current.style.minHeight = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 200 ? "auto" : "hidden"
      }`;
    }
  }, [newPrompt]);

  useEffect(() => {
    // Get models
    fetch("http://localhost:11434/api/tags")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAvailableModels(data.models);
        console.log(data.models[0]?.name);
        setActiveModel(data.models[0]?.name);
        const initOllama = new ChatOllama({
          baseUrl: "http://localhost:11434",
          model: data.models[0]?.name,
        });
        setOllama(initOllama);
      });

    // Get existing conversations
    getExistingConvos();
  }, []);

  async function getExistingConvos() {
    fetch("../api/fs/get-convos", {
      method: "POST", // or 'GET', 'PUT', etc.
      body: JSON.stringify({
        conversationPath: "./conversations",
      }),
    }).then((response) =>
      response.json().then((data) => setConversations(data)),
    );
  }

  async function triggerPrompt() {
    if (!ollama) return;
    if (messages.length == 0) getName(newPrompt);
    const msg = {
      type: "human",
      id: generateRandomString(8),
      timestamp: Date.now(),
      content: newPrompt,
    };
    const model = activeModel;
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
    let updatedMessages = [...msgCache];
    for await (const chunk of stream) {
      streamedText += chunk.content;
      const aiMsg = {
        type: "ai",
        id: generateRandomString(8),
        timestamp: Date.now(),
        content: streamedText,
        model,
      };
      updatedMessages = [...msgCache, aiMsg];
      setMessages(() => updatedMessages);
    }

    persistConvo(updatedMessages);
  }

  async function persistConvo(messages: any[]) {
    let name = activeConversation;
    if (name == "") {
      name = (await getName(newPrompt)).trim();
      console.log(name.trim());
      setActiveConversation(name.trim());
    }

    fetch("../api/fs/persist-convo", {
      method: "POST", // or 'GET', 'PUT', etc.
      body: JSON.stringify({
        conversationPath: "./conversations",
        messages: messages,
        convoTitle: name.trim().replaceAll('"', ""),
        filename:
          name
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll(":", "-")
            .replaceAll('"', "") + ".json",
      }),
    }).then(() => getExistingConvos());
  }

  function loadConvo(conversation: { title: string; filePath: string }) {
    if (activeConversation == conversation.title) return;
    fetch("../api/fs/get-convo-by-path", {
      method: "POST",
      body: JSON.stringify({
        conversationPath: conversation.filePath,
      }),
    }).then((response) =>
      response.json().then((data) => {
        setMessages(data.messages);
        setActiveConversation(conversation.title);
      }),
    );
  }

  function getName(input: string) {
    const nameOllama = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "llama2",
      verbose: false,
    });
    return nameOllama!
      .predict(
        "You're a tool, that receives an input and responds exclusively with a 2-5 word summary of the topic (and absolutely no prose) based specifically on the words used in the input (not the expected output). Each word in the summary should be carefully chosen so that it's perfecly informative - and serve as a perfect title for the input. Now, return the summary for the following input:\n" +
          input,
      )
      .then((name) => name);
  }

  return (
    <main className="relative flex max-h-screen min-h-screen items-center justify-between overflow-hidden">
      <motion.div
        className={cn("absolute left-0 top-0 z-50 p-3")}
        initial={false}
        animate={menuState ? "open" : "closed"}
      >
        <MenuToggle toggle={() => toggleMenuState()} />
      </motion.div>
      <motion.div
        layout
        className={cn(
          "flex max-h-screen min-h-screen flex-col overflow-x-visible border-r py-12",
          { "w-80 border-white/10": menuState },
          { "-z-0 w-0 border-white/0": !menuState },
        )}
      >
        {menuState &&
          conversations.map((c) => (
            <div
              className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-white/5"
              key={c.title}
              onClick={() => loadConvo(c)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{c.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <CopyIcon className="h-4 w-4 fill-white/50 hover:fill-white/75" />
                <TrashIcon className="h-4 w-4 fill-white/50 hover:fill-white/75" />
              </div>
            </div>
          ))}
      </motion.div>
      <div className="flex max-h-screen min-h-screen w-full flex-col">
        <AppNavbar
          documentName={activeConversation}
          setDocumentName={() => {}}
          activeModel={activeModel}
          availableModels={availableModels}
          setActiveModel={setActiveModel}
          setOllama={setOllama}
        />
        <div className="flex w-full flex-1 flex-shrink flex-col items-center justify-end gap-y-4 overflow-hidden whitespace-break-spaces">
          <div className="flex w-full flex-1 flex-col items-center justify-end gap-y-4 overflow-scroll whitespace-break-spaces">
            <div className="block h-fit w-full flex-col items-center justify-center gap-y-1 overflow-scroll rounded-md p-2">
              {messages.map((msg) => (
                <div
                  key={"message-" + msg.id}
                  className={cn(
                    "flex h-fit max-w-[80%] cursor-pointer flex-col items-start gap-y-1 rounded-md px-2 py-1",
                    { "ml-auto": msg.type == "human" },
                    { "mr-auto": msg.type == "ai" },
                  )}
                >
                  <div
                    className={cn(
                      "flex h-fit cursor-pointer flex-col items-center gap-y-1 rounded-md border border-[#191919] px-2 py-1",
                      { "ml-auto": msg.type == "human" },
                      { "mr-auto": msg.type == "ai" },
                    )}
                  >
                    <p className="mr-auto text-xs text-white/50">
                      {(msg?.model?.split(":")[0] || "user") +
                        " • " +
                        new Date(msg.timestamp).toLocaleDateString() +
                        " " +
                        new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                    <Markdown
                      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                      className={"mr-auto flex flex-col text-sm text-white"}
                    >
                      {msg.content.trim()}
                    </Markdown>
                  </div>
                  <div
                    className={cn(
                      "my-2 flex gap-x-1",
                      { "ml-auto": msg.type == "human" },
                      { "mr-auto": msg.type == "ai" },
                    )}
                  >
                    <RefreshIcon className="h-4 w-4 fill-white/50 hover:fill-white/75" />
                    <CopyIcon className="h-4 w-4 fill-white/50 hover:fill-white/75" />
                    <TrashIcon className="h-4 w-4 fill-white/50 hover:fill-white/75" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4 flex max-h-[200px] min-h-[56px] w-full flex-shrink-0 resize-none appearance-none overflow-hidden rounded-md px-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex">
          <textarea
            ref={textareaRef}
            onChange={(e) => {
              if (e.target.value != "\n") setNewPrompt(e.target.value);
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.metaKey &&
                !e.shiftKey &&
                !e.altKey &&
                newPrompt !== ""
              ) {
                triggerPrompt();
              } else if (
                e.key === "Enter" &&
                (e.metaKey || !e.shiftKey || !e.altKey)
              ) {
                console.log(e);
              }
            }}
            rows={1}
            className="flex max-h-[200px] w-full resize-none appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
            placeholder="Send a message"
            value={newPrompt}
          ></textarea>
        </div>
      </div>
    </main>
  );
}
