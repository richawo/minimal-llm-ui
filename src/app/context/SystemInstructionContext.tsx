"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { 
  SystemInstruction, 
  getDefaultSystemInstruction, 
  getSystemInstructionById,
  getAllSystemInstructions,
  addSystemInstruction,
  updateSystemInstruction
} from "@/utils/systemInstructions";

// Create context with default values
const SystemInstructionContext = createContext<{
  activeSystemInstruction: SystemInstruction;
  setActiveSystemInstructionById: (id: string) => void;
  allSystemInstructions: SystemInstruction[];
  addNewSystemInstruction: (name: string, content: string) => void;
  updateExistingSystemInstruction: (id: string, name: string, content: string) => void;
}>({
  activeSystemInstruction: getDefaultSystemInstruction(),
  setActiveSystemInstructionById: () => {},
  allSystemInstructions: getAllSystemInstructions(),
  addNewSystemInstruction: () => {},
  updateExistingSystemInstruction: () => {},
});

// Hook to use the system instruction context
export function useSystemInstruction() {
  return useContext(SystemInstructionContext);
}

// Provider component
export function SystemInstructionProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the default system instruction
  const [activeSystemInstruction, setActiveSystemInstruction] = useState<SystemInstruction>(
    getDefaultSystemInstruction()
  );

  const [allSystemInstructions, setAllSystemInstructions] = useState<SystemInstruction[]>(
    getAllSystemInstructions()
  );

  // Load the active system instruction from localStorage on component mount
  useEffect(() => {
    const storedInstructionId = localStorage.getItem("activeSystemInstructionId");
    if (storedInstructionId) {
      const instruction = getSystemInstructionById(storedInstructionId);
      if (instruction) {
        setActiveSystemInstruction(instruction);
      }
    }
  }, []);

  // Function to set the active system instruction by ID
  const setActiveSystemInstructionById = (id: string) => {
    const instruction = getSystemInstructionById(id);
    if (instruction) {
      setActiveSystemInstruction(instruction);
      localStorage.setItem("activeSystemInstructionId", id);
    }
  };

  // Function to add a new system instruction
  const addNewSystemInstruction = (name: string, content: string) => {
    // Create a new instruction object
    const newInstruction: SystemInstruction = {
      id: `instruction-${Date.now()}`,
      name,
      content
    };

    // Add it to the system instructions
    addSystemInstruction(newInstruction);

    // Update the local state with the latest instructions
    setAllSystemInstructions(getAllSystemInstructions());

    // Return the new instruction ID in case it's needed
    return newInstruction.id;
  };

  // Function to update an existing system instruction
  const updateExistingSystemInstruction = (id: string, name: string, content: string) => {
    // Update the instruction
    updateSystemInstruction(id, name, content);

    // Update the local state with the latest instructions
    setAllSystemInstructions(getAllSystemInstructions());

    // If the active instruction was updated, update it in the state
    if (activeSystemInstruction.id === id) {
      const updatedInstruction = getSystemInstructionById(id);
      if (updatedInstruction) {
        setActiveSystemInstruction(updatedInstruction);
      }
    }
  };

  // Context value
  const value = {
    activeSystemInstruction,
    setActiveSystemInstructionById,
    allSystemInstructions,
    addNewSystemInstruction,
    updateExistingSystemInstruction,
  };

  return (
    <SystemInstructionContext.Provider value={value}>
      {children}
    </SystemInstructionContext.Provider>
  );
}
