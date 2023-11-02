"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PromptsContext = createContext<any>(null);

export function usePrompts() {
  return useContext(PromptsContext);
}

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [promptTemplate, setPromptTemplate] = useState<
    {
      name: string;
      content: string;
      inputs: string[];
    }[]
  >([]);

  // Load prompts from local storage on component mount
  useEffect(() => {
    updatePromptTemplate();
  }, []);

  function updatePromptTemplate() {
    const storedPromptsString = localStorage.getItem("prompts");

    if (storedPromptsString) {
      const storedPrompts = JSON.parse(storedPromptsString);
      setPromptTemplate(storedPrompts);
    }
  }

  function addPromptTemplate<T>(prompt: T) {
    const newPromptTemplate = [...promptTemplate, prompt];
    setPromptTemplate(newPromptTemplate);
    localStorage.setItem("prompts", JSON.stringify(newPromptTemplate));
  }

  const value = { promptTemplate, updatePromptTemplate, addPromptTemplate };

  return (
    <PromptsContext.Provider value={value}>{children}</PromptsContext.Provider>
  );
}
