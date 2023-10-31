import { createContext, useContext, useEffect, useState } from "react";

const PromptsContext = createContext<any>(null);

export function usePrompts() {
  return useContext(PromptsContext);
}

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [promptTemplate, setPromptTemplate] = useState([]);

  // Load prompts from local storage on component mount
  useEffect(() => {
    const storedPromptsString = localStorage.getItem("prompts");

    if (storedPromptsString) {
      const storedPrompts = JSON.parse(storedPromptsString);
      setPromptTemplate(storedPrompts);
    }
  }, []);

  const value = { promptTemplate };

  return (
    <PromptsContext.Provider value={value}>{children}</PromptsContext.Provider>
  );
}
