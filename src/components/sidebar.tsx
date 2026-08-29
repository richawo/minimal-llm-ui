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
  clearDocuments: () => void;
  setDocumentEntries?: (documents: DocumentEntry[] | DocumentEntry | string, guid?: string) => void;
  conversations: { title: string; filePath: string }[];
  activeConversation: string;
  menuState: boolean;
  toggleMenuState: Cycle;
};

type DocumentEntry = {
  filename: string;
  guid: string;
  selected?: boolean;
};

export default function Sidebar({
  setMessages,
  setConversations,
  setActiveConversation,
  setNewPrompt,
  clearDocuments,
  setDocumentEntries,
  conversations,
  activeConversation,
  menuState,
  toggleMenuState,
}: Props) {
  const sidebarWidth = 320; // width in px when open

  function loadConvo(conversation: { title: string; filePath: string }) {
    if (activeConversation === conversation.title) return;
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
    }).then(() => {
      setConversations(
        conversations.filter((c) => c.filePath !== conversation.filePath),
      );
      if (activeConversation === conversation.title) {
        if (conversations.length > 0) loadConvo(conversations[0]);
      }
    });
  }

  function startNewChat() {
    setMessages([]);
    setActiveConversation("");
    setNewPrompt("");
    clearDocuments();
    if (setDocumentEntries) {
      setDocumentEntries([]);
    }
    toggleMenuState();
  }

  return (
    <>
      {/* Toggle button that moves horizontally with the sidebar */}
      <motion.div
        className="absolute top-4 z-50"
        animate={{
          left: menuState ? sidebarWidth + 16 : 16, 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <MenuToggle toggle={() => toggleMenuState()} toggled={menuState} />
      </motion.div>

      {/* Sidebar container with animated width */}
      <motion.div
        className="fixed left-15 top-0 h-full bg-white shadow-lg overflow-hidden"
        initial={false}
        animate={{ width: menuState ? sidebarWidth : 0 }}
        style={{ zIndex: 40 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sidebar content fades in/out based on menuState */}
        <div
          className="flex h-full flex-col pt-16 transition-opacity duration-200"
          style={{
            opacity: menuState ? 1 : 0,
            pointerEvents: menuState ? "auto" : "none",
          }}
        >
          <div className="px-4 pb-4">
            <button
              onClick={startNewChat}
              className="flex w-full items-center justify-between rounded-lg bg-[#01a982] px-3 py-2 text-white transition-colors hover:bg-[#00896a]"
            >
              <span>New Chat</span>
              <RightChevron className="h-5 w-5 fill-white" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            {conversations.map((c) => (
              <div
                key={c.title}
                className={cn(
                  "group mb-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors",
                  activeConversation === c.title
                    ? "bg-gray-100"
                    : "hover:bg-gray-50",
                )}
                onClick={() => loadConvo(c)}
              >
                <span className="truncate text-sm text-gray-700">{c.title}</span>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyIcon className="h-4 w-4 fill-gray-500 hover:fill-[#01a982]" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConvo(c);
                    }}
                    className="cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4 fill-gray-500 hover:fill-red-500" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
