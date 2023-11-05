"use client";

import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext<any>(null);

export const useModal = () => {
  return useContext(ModalContext);
};

export enum AppModal {
  SAVE_PROMPT = "savePrompt",
}

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalConfig, setModalConfig] = useState<{
    modal?: AppModal;
    data?: any;
  }>({ modal: undefined, data: undefined });

  const value = {
    modalConfig,
    setModalConfig
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

