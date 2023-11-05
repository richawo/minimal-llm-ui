"use client";

import { cn } from "@/utils/cn";
import { Cycle, motion } from "framer-motion";
import { CopyIcon } from "./icons/copy-icon";
import { RightChevron } from "./icons/right-chevron";
import { TrashIcon } from "./icons/trash-icon";
import { MenuToggle } from "./menu-toggle";

type Props = {
  setMessages: (
    messages: {
      type: string;
      id: any;
      timestamp: number;
      content: string;
      model?: string;
    }[],
  ) => void;
  setConversations: (
    conversations: { title: string; filePath: string }[],
  ) => void;
  setActiveConversation: (title: string) => void;
  setNewPrompt: (newPrompt: string) => void;
  conversations: { title: string; filePath: string }[];
  activeConversation: string;
  menuState: boolean;
  toggleMenuState: Cycle;
};

export default function Sidebar({
  setMessages,
  setConversations,
  setActiveConversation,
  setNewPrompt,
  conversations,
  activeConversation,
  menuState,
  toggleMenuState,
}: Props) {
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

  function deleteConvo(conversation: { title: string; filePath: string }) {
    fetch("../api/fs/delete-convo-by-path", {
      method: "POST",
      body: JSON.stringify({
        conversationPath: conversation.filePath,
      }),
    }).then((response) => {
      setConversations([
        ...conversations.filter((c) => c.filePath !== conversation.filePath),
      ]);
      if (activeConversation == conversation.title) {
        loadConvo(conversations[0]);
      }
    });
  }

  function startNewChat() {
    setMessages([]);
    setActiveConversation("");
    setNewPrompt("");
    toggleMenuState();
  }

  return (
    <>
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
          { "w-80 min-w-[20rem] border-white/10": menuState },
          { "-z-0 w-0 border-white/0": !menuState },
        )}
      >
        {menuState && (
          <motion.button
            onClick={startNewChat}
            whileTap={{ backgroundColor: "rgba(255,255,255,0.8)" }}
            whileHover={{ backgroundColor: "rgba(255,255,255,1)" }}
            className="flex cursor-pointer items-center justify-between bg-white/80 px-4 py-2 text-black"
          >
            <span className="text-xs font-semibold">New Chat</span>
            <RightChevron className="h-4 w-4 fill-black" />
          </motion.button>
        )}
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
                <TrashIcon
                  onClick={() => deleteConvo(c)}
                  className="h-4 w-4 fill-white/50 hover:fill-white/75"
                />
              </div>
            </div>
          ))}
      </motion.div>
    </>
  );
}
