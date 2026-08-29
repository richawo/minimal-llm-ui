"use client";

import { ChatOllama } from "langchain/chat_models/ollama";
import { baseUrl } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

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
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(activeModel);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDocumentName(value); // Call the callback function to update the parent component
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

  useEffect(() => {
    setActiveModel(selectedModel);
    const newOllama = new ChatOllama({
      baseUrl: baseUrl,
      model: selectedModel,
    });
    //store in local storage
    localStorage.setItem("initialLocalLM", selectedModel);
    setOllama(newOllama);
  },[selectedModel])

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <nav className="sticky left-0 top-0 z-20 w-full border-b border-white/10 bg-black">
        <div className="mx-auto flex flex-wrap items-center justify-between px-20 py-2.5">
          <div className="flex space-x-8">
            <input
              className="w-64 ring-none flex cursor-text items-center gap-x-2 rounded-md border-transparent bg-transparent px-2 py-1 text-xs font-medium text-white outline-none placeholder:text-white/80 hover:bg-white/10 "
              placeholder="Untitled"
              value={documentName}
              onChange={handleInputChange}
            ></input>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger >
              <p
                className="cursor-pointer text-xs text-white transition-colors hover:bg-white/10 rounded-md px-2 py-1"
                contentEditable={false}
              // onClick={toggleModel}
              >
                {activeModel}
              </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={5}
              className="w-64"
              ref={shareMenuRef}
            >
              <DropdownMenuRadioGroup value={activeModel} onValueChange={setSelectedModel}>
              {/* <DropdownMenuRadioGroup> */}
                {availableModels.map((item)=>(
                  <DropdownMenuRadioItem key={item.name} value={item.name}>{item.name}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
