"use client";

import { ChatOllama } from "langchain/chat_models/ollama";
import { baseUrl } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { useSystemInstruction } from "@/app/context/SystemInstructionContext";
import { AppModal, useModal } from "@/app/context/ModalContext";

type DocumentEntry = {
  filename: string;
  guid: string;
  selected?: boolean;
};

type Props = {
  documentName: string;
  setDocumentName: Function;
  activeModel: string;
  availableModels: any[];
  setActiveModel: Function;
  setOllama: Function;
  selectedDocuments: DocumentEntry[];
  onDocumentToggle: (index: number) => void;
};

export default function AppNavbar({
  documentName,
  setDocumentName,
  activeModel,
  availableModels,
  setActiveModel,
  setOllama,
  selectedDocuments,
  onDocumentToggle,
}: Props) {
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isDocumentMenuOpen, setIsDocumentMenuOpen] = useState(false);
  const { activeSystemInstruction, allSystemInstructions, setActiveSystemInstructionById } = useSystemInstruction();
  const { setModalConfig } = useModal();

  const systemMenuRef = useRef<HTMLDivElement>(null);
  const documentMenuRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDocumentName(value);
  };

  useEffect(() => {
    const handleDocumentClick = (event: any) => {
      if (
        isSystemMenuOpen &&
        systemMenuRef.current &&
        !systemMenuRef.current.contains(event.target)
      ) {
        setIsSystemMenuOpen(false);
      }

      if (
        isDocumentMenuOpen &&
        documentMenuRef.current &&
        !documentMenuRef.current.contains(event.target)
      ) {
        setIsDocumentMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isSystemMenuOpen, isDocumentMenuOpen]);

  function toggleModel() {
    const i =
      (availableModels.findIndex((x) => x.name == activeModel) + 1) %
      availableModels.length;
    console.log(i, activeModel, availableModels);
    setActiveModel(availableModels[i].name);
    const newOllama = new ChatOllama({
      baseUrl: baseUrl,
      model: availableModels[i]?.name,
    });
    localStorage.setItem("initialLocalLM", availableModels[i]?.name);
    setOllama(newOllama);
  }

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <header className="chat-header ml-10">
        <div className="logo-container">
          <img src="/Hewlett_Packard_Enterprise_logo.svg" alt="Hewlett Packard Enterprise" className="logo" />
        </div>
        <h1 className="header-title flex-1 text-center">Interactive Partner Portal (demo)</h1>

        {/* HPE POC Badge */}
        <div>
          <span className="text-xs font-medium text-[var(--hpe-green)]">HPE POC</span>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-gray-20 flex justify-end p-2 border-t">
         {/* Document Name */}
          <input
            type="text"
            value={documentName}
            onChange={handleInputChange}
            placeholder="Document Name"
            className="w-60 text-xs px-2 py-2 bg-gray-100 rounded focus:ring-1 focus:ring-[#01a982] focus:border-[var(--hpe-green)] transition-colors mr-auto ml-12"
          />
        <div className="flex items-center gap-4">
         
          {/* Document Dropdown */}
          <div className="relative" ref={documentMenuRef}>
            <button
              className="flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm
               hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={() => setIsDocumentMenuOpen(!isDocumentMenuOpen)}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">
                {selectedDocuments.length > 0
                  ? `${selectedDocuments.filter(d => d.selected !== false).length} documents`
                  : "No documents"}
              </span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDocumentMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 rounded-md shadow-lg bg-white border border-gray-200 z-50 max-h-80 overflow-y-auto">
                <div className="py-1">
                  {selectedDocuments.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-600">
                          {selectedDocuments.filter(d => d.selected !== false).length} of {selectedDocuments.length} selected
                        </p>
                      </div>
                      {selectedDocuments.map((doc, index) => (
                        <div key={doc.guid} className="px-4 py-2 hover:bg-gray-50">
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doc.selected !== false}
                              onChange={() => onDocumentToggle(index)}
                              className="mt-0.5 h-4 w-4 text-[#01a982] rounded border-gray-300 focus:ring-[#01a982]"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-xs font-medium text-gray-900 break-words">{doc.filename}</div>
                              <div className="text-xs text-gray-500">ID: {doc.guid.substring(0, 8)}...</div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-xs text-gray-600">
                      No documents available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Instruction Dropdown */}
          <div className="relative" ref={systemMenuRef}>
            <button
              className="flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm hover:text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">{activeSystemInstruction.name}</span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isSystemMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-md shadow-lg bg-white border border-gray-200 z-50">
                <div className="py-1">
                  {allSystemInstructions.map((instruction) => (
                    <div
                      key={instruction.id}
                      className={`flex items-center justify-between px-4 py-2 text-xs ${instruction.id === activeSystemInstruction.id
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <button
                        className="flex-grow text-left"
                        onClick={() => {
                          setActiveSystemInstructionById(instruction.id);
                          setIsSystemMenuOpen(false);
                        }}
                      >
                        {instruction.name}
                      </button>
                      <button
                        className="ml-2 p-1 rounded-full hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalConfig({
                            modal: AppModal.EDIT_SYSTEM_INSTRUCTION,
                            data: instruction
                          });
                          setIsSystemMenuOpen(false);
                        }}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <hr className="my-1 border-gray-200" />
                  <button
                    className="block w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-[var(--hpe-green)]]"
                    onClick={() => {
                      setModalConfig({ modal: AppModal.ADD_SYSTEM_INSTRUCTION });
                      setIsSystemMenuOpen(false);
                    }}
                  >
                    + Add New Instruction
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Model selector */}
          <button
            className="rounded-md bg-[#01a982] px-4 py-1.5 text-sm font-medium !text-white transition-all hover:bg-[#00896a]"
            onClick={toggleModel}
          >
            {activeModel || "Select Model"}
          </button>


        </div>
      </div>
    </nav>
  );
}