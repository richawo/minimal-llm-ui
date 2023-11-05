"use client";

// create an interface for the prompt template
interface PromptTemplate {
  name: string;
  content: string;
  inputs: string[];
}

import { createContext, useContext, useEffect, useState } from "react";

const PromptsContext = createContext<any>(null);

export function usePrompts() {
  return useContext(PromptsContext);
}

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate[]>([]);

  //add a state to manage the active prompt template
  const [activePromptTemplate, setActivePromptTemplate] =
    useState<PromptTemplate>();

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

  function addPromptTemplate(prompt: {
    name: string;
    content: string;
    inputs: string[];
  }) {
    const newPromptTemplate = [...promptTemplate, prompt];
    setPromptTemplate(newPromptTemplate);
    localStorage.setItem("prompts", JSON.stringify(newPromptTemplate));
  }

  const value = {
    promptTemplate,
    updatePromptTemplate,
    addPromptTemplate,
    activePromptTemplate,
    setActivePromptTemplate,
  };

  return (
    <PromptsContext.Provider value={value}>{children}</PromptsContext.Provider>
  );
}
