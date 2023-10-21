"use client";

import { ChatOllama } from "langchain/chat_models/ollama";
import { useEffect, useRef, useState } from "react";

type Props = {
  documentName: string;
  setDocumentName: Function;
  activeModel: string;
  availableModels: any[];
  setActiveModel: Function;
  setOllama: Function;
};

export default function AppNavbar({
  documentName,
  setDocumentName,
  activeModel,
  availableModels,
  setActiveModel,
  setOllama,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDocumentName(value); // Call the callback function to update the parent component
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleShareMenu = () => {
    console.log(isShareMenuOpen);
    setIsShareMenuOpen(!isShareMenuOpen);
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleDocumentClick = (event: any) => {
      if (
        isShareMenuOpen &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setIsShareMenuOpen(false);
      }

      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isShareMenuOpen, isProfileMenuOpen]);

  function toggleModel() {
    const i =
      (availableModels.findIndex((x) => x.name == activeModel) + 1) %
      availableModels.length;
    console.log(i, activeModel, availableModels);
    setActiveModel(availableModels[i].name);
    const newOllama = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: availableModels[i]?.name,
    });
    setOllama(newOllama);
  }

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <nav className="sticky left-0 top-0 z-20 w-full border-b border-white/10 bg-black">
        <div className="mx-auto flex flex-wrap items-center justify-between px-20 py-2.5">
          <div className="flex space-x-8">
            <input
              className="ring-none -mx-2 -my-1 flex cursor-text items-center gap-x-2 rounded-xl border-transparent bg-transparent px-2 py-1 text-xs font-medium text-white outline-none placeholder:text-white/80 hover:bg-white/10 "
              placeholder="Untitled"
              value={documentName}
              onChange={handleInputChange}
            ></input>
          </div>
          <button
            className="cursor-pointer text-xs text-white/50 transition-colors hover:text-white/80"
            contentEditable={false}
            onClick={toggleModel}
          >
            {activeModel}
          </button>
          <div className="flex md:order-2 md:hidden">
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
              aria-controls="navbar-sticky"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
