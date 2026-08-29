"use client";
import AppNavbar from "@/components/app-navbar";
import CommandMenu from "@/components/command-menu";
import CommandTextInput from "@/components/command-text-input";
import ExpandingTextInput from "@/components/expanding-text-input";
import { CopyIcon } from "@/components/icons/copy-icon";
import { RefreshIcon } from "@/components/icons/refresh-icon";
import { SaveIcon } from "@/components/icons/save-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import Sidebar from "@/components/sidebar";
import { cn } from "@/utils/cn";
import { baseUrl, fallbackModel, vectorSearchBaseUrl } from "@/utils/constants";
import generateRandomString from "@/utils/generateRandomString";
import { useCycle } from "framer-motion";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppModal, useModal } from "./context/ModalContext";
import { usePrompts } from "./context/PromptContext";
import { useSystemInstruction } from "./context/SystemInstructionContext";
import { getSystemInstructionById } from "@/utils/systemInstructions";

// Define the DocumentEntry type
type DocumentEntry = {
  filename: string;
  guid: string;
  selected?: boolean;
};

export default function Home() {
  const { setModalConfig } = useModal();
  const { activePromptTemplate, setActivePromptTemplate } = usePrompts();
  const { activeSystemInstruction } = useSystemInstruction();
  const [newPrompt, setNewPrompt] = useState("");
  const [messages, setMessages] = useState<
    {
      type: string;
      id: any;
      timestamp: number;
      content: string;
      model?: string;
    }[]
  >([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [activeModel, setActiveModel] = useState<string>("");
  const [ollama, setOllama] = useState<ChatOllama>();
  const [conversations, setConversations] = useState<{ title: string; filePath: string }[]>([]);
  const [activeConversation, setActiveConversation] = useState<string>("");
  const [menuState, toggleMenuState] = useCycle(false, true);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentEntry[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentEntry[]>([]);
  const msgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("All selectedDocuments:", selectedDocuments);
    console.log("Documents with selected=true:", selectedDocuments.filter(doc => doc.selected === true));
    console.log("Documents with selected=false:", selectedDocuments.filter(doc => doc.selected === false));
    console.log("Documents with selected=undefined:", selectedDocuments.filter(doc => doc.selected === undefined));

    // Filter to show only selected documents in the right panel
    const selected = selectedDocuments.filter(doc => doc.selected === true);
    setFilteredDocuments(selected);
    console.log("Setting filteredDocuments to:", selected);
  }, [selectedDocuments]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  useEffect(() => {
    // Get the initial model
    getInitialModel();

    // Get existing conversations
    getExistingConvos();

    // Set up window.setDocumentValues function
    setupWindowDocumentValues();
  }, []);

  // Function to handle document values from vector search
  function setupWindowDocumentValues() {
    // @ts-ignore
    window.setDocumentValues = (documents: DocumentEntry[] | DocumentEntry | string, guid?: string) => {
      console.log('window.setDocumentValues called with:', documents);

      if (typeof documents === 'string' && guid) {
        const newEntry: DocumentEntry = {
          filename: documents,
          guid: guid,
          selected: true
        };
        setSelectedDocuments(prevDocs => {
          // Remove any existing document with the same guid first
          const filtered = prevDocs.filter(doc => doc.guid !== guid);
          return [...filtered, newEntry];
        });
      } else if (Array.isArray(documents)) {
        setSelectedDocuments(prevDocs => {
          // Create a map of existing documents
          const existingMap = new Map(prevDocs.map(doc => [doc.guid, doc]));

          // Update or add new documents
          documents.forEach(newDoc => {
            existingMap.set(newDoc.guid, { ...newDoc, selected: true });
          });

          return Array.from(existingMap.values());
        });
      } else if (typeof documents === 'object') {
        const doc = documents as DocumentEntry;
        setSelectedDocuments(prevDocs => {
          // Remove any existing document with the same guid first
          const filtered = prevDocs.filter(d => d.guid !== doc.guid);
          return [...filtered, { ...doc, selected: true }];
        });
      }
    };

    return () => {
      // @ts-ignore
      delete window.setDocumentValues;
    };
  }

  function getInitialModel() {
    fetch(`${baseUrl}/api/tags`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Available models from API:", data);

        if (!data.models || data.models.length === 0) {
          console.error("No models available from Ollama");
          return;
        }

        setAvailableModels(data.models);

        const storedModel = localStorage.getItem("initialLocalLM");
        let modelToUse = null;

        if (
          storedModel &&
          storedModel !== "" &&
          data.models.findIndex(
            (m: { name: string }) =>
              m.name.toLowerCase() === storedModel.toLowerCase(),
          ) > -1
        ) {
          modelToUse = storedModel;
        } else {
          modelToUse = data.models[0]?.name;
        }

        console.log("Setting active model to:", modelToUse);
        setActiveModel(modelToUse);

        if (modelToUse) {
          const newOllama = new ChatOllama({
            baseUrl: baseUrl,
            model: modelToUse,
          });
          console.log("Created Ollama instance:", newOllama);
          setOllama(newOllama);
        }
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        // Set a fallback model if the API fails
        const fallbackModelName = fallbackModel || "llama2";
        console.log("Using fallback model:", fallbackModelName);

        setActiveModel(fallbackModelName);
        setAvailableModels([{ name: fallbackModelName }]);

        const newOllama = new ChatOllama({
          baseUrl: baseUrl,
          model: fallbackModelName,
        });
        setOllama(newOllama);
      });
  }

  async function getExistingConvos() {
    fetch("../api/fs/get-convos", {
      method: "POST",
      body: JSON.stringify({
        conversationPath: "./conversations",
      }),
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => setConversations(data));
    });
  }

  async function performVectorSearch(query: string) {
    try {
      const selectedDocs = selectedDocuments.filter(doc => doc.selected);

      let response;

      if (selectedDocs.length > 0) {
        const document_guids = selectedDocs.map(doc => doc.guid);

        response = await fetch(`${vectorSearchBaseUrl}/v1.0/vector/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: query,
            document_guids: document_guids,
            limit: 10
          })
        });
      } else {
        response = await fetch(`${vectorSearchBaseUrl}/v1.0/vector/router/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: query,
            document_guid: "f49f92f7-8cdf-4f44-b327-0519e2aad881",
            limit: 1
          })
        });
      }

      if (!response.ok) {
        console.error('Vector search failed:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error performing vector search:', error);
      return null;
    }
  }

  async function triggerPrompt(input: string = newPrompt) {
    console.log("triggerPrompt called with:", input);
    console.log("ollama:", ollama);
    console.log("activeModel:", activeModel);

    if (!ollama) {
      console.error("Ollama is not initialized!");
      return;
    }

    scrollToBottom();

    if (messages.length === 0) {
      console.log("First message, getting name...");
      getName(input);
    }

    const msg = {
      type: "human",
      id: generateRandomString(8),
      timestamp: Date.now(),
      content: input,
    };

    console.log("Creating message:", msg);

    const model = activeModel;
    let streamedText = "";

    // Update messages state properly
    const msgCache = [...messages, msg];
    setMessages(msgCache);

    console.log("Messages after push:", msgCache);

    // First perform vector search
    console.log("Performing vector search...");
    const vectorSearchResults = await performVectorSearch(input);
    console.log("Vector search results:", vectorSearchResults);

    // Prepare context from vector search results
    let contextFromVectorSearch = "";
    if (vectorSearchResults && vectorSearchResults.length > 0) {
      if (window.setDocumentValues) {
        const documentEntries: DocumentEntry[] = vectorSearchResults.map((result: any) => ({
          filename: decodeURIComponent(result.object_key),
          guid: result.document_guid,
          selected: true
        }));

        window.setDocumentValues(documentEntries);
      }

      contextFromVectorSearch = "Context from vector search:\n" +
        vectorSearchResults.map((result: any) => result.content).join("\n") +
        "\n\nUser query: " + input;
    } else {
      contextFromVectorSearch = input;
    }

    // Use the context in the request to Ollama
    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    const systemInstruction = selectedDocs.length === 0
      ? getSystemInstructionById("concise") || activeSystemInstruction
      : activeSystemInstruction;

    console.log(`Using ${systemInstruction.name} system instruction`);

    const messagesWithSystemInstruction = [
      new SystemMessage(systemInstruction.content),
      ...msgCache.map((m, index) => {
        if (index === msgCache.length - 1 && m.type === "human") {
          return new HumanMessage(contextFromVectorSearch);
        } else {
          return m.type === "human"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content);
        }
      })
    ];

    try {
      const stream = await ollama.stream(messagesWithSystemInstruction);

      setNewPrompt("");
      setActivePromptTemplate(undefined);

      let updatedMessages = [...msgCache];
      let c = 0;

      for await (const chunk of stream) {
        streamedText += chunk.content;
        const aiMsg = {
          type: "ai",
          id: generateRandomString(8),
          timestamp: Date.now(),
          content: streamedText,
          model,
        };
        updatedMessages = [...msgCache, aiMsg];
        setMessages(updatedMessages);
        c++;
        if (c % 8 == 0) scrollToBottom();
      }

      scrollToBottom();
      persistConvo(updatedMessages);
    } catch (error) {
      console.error("Error streaming from Ollama:", error);
      // Optionally add an error message to the chat
      const errorMsg = {
        type: "ai",
        id: generateRandomString(8),
        timestamp: Date.now(),
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        model,
      };
      const updatedMessages = [...msgCache, errorMsg];
      setMessages(updatedMessages);
    }
  }

  async function persistConvo(messages: any[]) {
    let name = activeConversation;
    if (name == "") {
      name = (await getName(newPrompt)).trim();
      setActiveConversation(name.trim());
    }

    fetch("../api/fs/persist-convo", {
      method: "POST",
      body: JSON.stringify({
        conversationPath: "./conversations",
        messages: messages,
        convoTitle: name.trim().replaceAll('"', ""),
        filename:
          name
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll(":", "-")
            .replaceAll('"', "") + ".json",
      }),
    }).then(() => getExistingConvos());
  }

  function deleteMessage(activeMsg: {
    type: string;
    id: any;
    timestamp: number;
    content: string;
    model?: string;
  }) {
    let filtered = messages.filter((m, i) => m.id != activeMsg.id);
    setMessages(() => filtered);
    persistConvo(filtered);
  }

  async function refreshMessage(activeMsg: {
    type: string;
    id: any;
    timestamp: number;
    content: string;
    model?: string;
  }) {
    if (!ollama) return;
    let index =
      messages.findIndex((m) => m.id == activeMsg.id) -
      (activeMsg.type == "human" ? 0 : 1);
    let filtered = messages.filter((m, i) => index >= i);

    setMessages(() => filtered);

    const model = activeModel;
    let streamedText = "";
    const msgCache = [...filtered];

    const lastHumanMessage = filtered.filter(m => m.type === "human").pop();
    let vectorSearchResults: any[] | null = null;

    if (lastHumanMessage) {
      vectorSearchResults = await performVectorSearch(lastHumanMessage.content);

      if (vectorSearchResults && vectorSearchResults.length > 0 && window.setDocumentValues) {
        const documentEntries: DocumentEntry[] = vectorSearchResults.map((result: any) => ({
          filename: decodeURIComponent(result.object_key),
          guid: result.document_guid,
          selected: true
        }));

        window.setDocumentValues(documentEntries);
      }
    }

    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    const systemInstruction = selectedDocs.length === 0
      ? getSystemInstructionById("concise") || activeSystemInstruction
      : activeSystemInstruction;

    const messagesForOllama = [
      new SystemMessage(systemInstruction.content),
      ...filtered.map((m, index) => {
        if (index === filtered.length - 1 && m.type === "human" && vectorSearchResults && vectorSearchResults.length > 0) {
          const contextFromVectorSearch = "Context from vector search:\n" +
            vectorSearchResults.map((result: any) => result.content).join("\n") +
            "\n\nUser query: " + m.content;
          return new HumanMessage(contextFromVectorSearch);
        } else {
          return m.type === "human"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content);
        }
      })
    ];

    const stream = await ollama.stream(messagesForOllama);
    setNewPrompt("");
    let updatedMessages = [...msgCache];
    let c = 0;
    for await (const chunk of stream) {
      streamedText += chunk.content;
      const aiMsg = {
        type: "ai",
        id: generateRandomString(8),
        timestamp: Date.now(),
        content: streamedText,
        model,
      };
      updatedMessages = [...msgCache, aiMsg];
      setMessages(() => updatedMessages);
      c++;
      if (c % 8 == 0) scrollToBottom();
    }

    scrollToBottom();
    persistConvo(updatedMessages);
  }

  const scrollToBottom = () => {
    if (msgContainerRef.current) {
      msgContainerRef.current.scrollTo({
        top: msgContainerRef.current.scrollHeight + 10000,
        behavior: "smooth",
      });
    }
  };

  function getName(input: string) {
    const nameOllama = new ChatOllama({
      baseUrl: baseUrl,
      model: activeModel && activeModel.trim() !== "" ? activeModel : fallbackModel,
      verbose: false,
    });
    return nameOllama!
      .predict(
        "You're a tool, that receives an input and responds exclusively with a 2-5 word summary of the topic for the HPE Partner Portal (and absolutely no prose) based specifically on the words used in the input (not the expected output). Each word in the summary should be carefully chosen so that it's perfectly informative - and serve as a perfect title for the input. Now, return the summary for the following input:\n" +
        input,
      )
      .then((name) => name);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex flex-col items-center w-16 bg-[#f7f7f7] border-r border-gray-200 py-4 z-10">
        {/* Top section */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          {/* Home icon (already correct) */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* Archive/Box icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </button>

          {/* Puzzle piece icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Bottom section */}
        <div className="flex flex-col items-center space-y-4">
          {/* Target/Crosshair icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Wrench/Tool icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Link/Chain icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          {/* Chart/Analytics icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Document/Clipboard icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Settings/Gear icon */}
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      <main className="relative flex h-screen w-screen items-stretch overflow-hidden bg-[#f7f7f7]">
        <Sidebar
          activeConversation={activeConversation}
          conversations={conversations}
          menuState={menuState}
          setActiveConversation={setActiveConversation}
          setConversations={setConversations}
          setMessages={setMessages}
          setNewPrompt={setNewPrompt}
          clearDocuments={() => setSelectedDocuments([])}
          setDocumentEntries={(documents) => {
            if (Array.isArray(documents) && documents.length === 0) {
              setSelectedDocuments([]);
            } else if (typeof documents === 'string' && arguments.length > 1) {
              const guid = arguments[1];
              const newEntry = {
                filename: documents,
                guid: guid,
                selected: true
              };
              setSelectedDocuments([newEntry]);
            } else if (Array.isArray(documents)) {
              setSelectedDocuments(documents);
            } else {
              if (typeof documents === 'string') {
                console.error("Expected DocumentEntry, received string:", documents);
                setSelectedDocuments([]);
              } else {
                setSelectedDocuments([documents]);
              }
            }
          }}
          toggleMenuState={toggleMenuState}
        />
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out",
            menuState ? "ml-[320px]" : "ml-0"
          )}
        >
          <AppNavbar
            documentName={activeConversation}
            setDocumentName={() => { }}
            activeModel={activeModel}
            availableModels={availableModels}
            setActiveModel={setActiveModel}
            setOllama={setOllama}
            selectedDocuments={selectedDocuments}
            onDocumentToggle={(index) => {
              const updatedDocuments = [...selectedDocuments];
              updatedDocuments[index] = {
                ...updatedDocuments[index],
                selected: updatedDocuments[index].selected === false ? true : false
              };
              setSelectedDocuments(updatedDocuments);
            }}
          />

          {/* Main content area with documents panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 overflow-hidden bg-[#f7f7f7]">
              <div className="flex h-full flex-col">
                <div
                  ref={msgContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-6 md:px-8"
                >
                  <div className="mx-auto max-w-4xl">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <h2 className="mb-2 text-2xl font-semibold text-gray-700">Welcome to the HPE Partner Portal AI Assistant</h2>
                          <p className="text-gray-500">Start a conversation to begin by telling us what system you're interested in getting some information about.</p>
                          <p className="text-gray-500">That will help the system narrow down the scope and provide the best responses</p>
                          <p className="text-gray-500">You can then select which documents you wish to research from the panel on the right</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={"message-" + msg.id}
                            className={cn(
                              "group relative flex gap-3",
                              msg.type === "human" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-3",
                                msg.type === "human"
                                  ? "bg-[#01a982] text-white"
                                  : "bg-white text-gray-800"
                              )}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-xs opacity-70">
                                  {msg?.model?.split(":")[0] || "You"} •{" "}
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <Markdown
                                remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                                className="prose prose-sm max-w-none"
                              >
                                {msg.content.trim()}
                              </Markdown>
                              <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                {msg.type === "human" && (
                                  <SaveIcon
                                    onClick={() => {
                                      setModalConfig({
                                        modal: AppModal.SAVE_PROMPT,
                                        data: msg,
                                      });
                                    }}
                                    className="h-4 w-4 cursor-pointer fill-current opacity-60 hover:opacity-100"
                                  />
                                )}
                                <RefreshIcon
                                  onClick={() => refreshMessage(msg)}
                                  className="h-4 w-4 cursor-pointer fill-current opacity-60 hover:opacity-100"
                                />
                                <CopyIcon
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                  }}
                                  className="h-4 w-4 cursor-pointer fill-current opacity-60 hover:opacity-100"
                                />
                                <TrashIcon
                                  onClick={() => {
                                    deleteMessage(msg);
                                  }}
                                  className="h-4 w-4 cursor-pointer fill-current opacity-60 hover:opacity-100"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t bg-white px-4 py-4 md:px-8">
                  <div className="mx-auto max-w-4xl">
                    <CommandMenu
                      showMenu={
                        !activePromptTemplate &&
                        !!newPrompt &&
                        newPrompt.startsWith("/") &&
                        newPrompt == "/" + newPrompt.replace(/[^a-zA-Z0-9_]/g, "")
                      }
                      filterString={newPrompt.substring(1)}
                    />
                    <div className="relative">
                      {activePromptTemplate ? (
                        <CommandTextInput
                          onKeyDown={(x) => {
                            if (
                              x.e.key === "Enter" &&
                              !x.e.metaKey &&
                              !x.e.shiftKey &&
                              !x.e.altKey &&
                              newPrompt !== ""
                            ) {
                              triggerPrompt(x.input);
                            }
                          }}
                        />
                      ) : (
                        <ExpandingTextInput
                          onChange={(e: any) => {
                            if (e.target.value != "\n") setNewPrompt(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.metaKey &&
                              !e.shiftKey &&
                              !e.altKey &&
                              newPrompt !== ""
                            ) {
                              e.preventDefault(); // Add this line
                              triggerPrompt();
                            }
                          }}
                          value={newPrompt}
                          placeholder="Send a message"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder-gray-500 focus:border-[#01a982] focus:outline-none focus:ring-2 focus:ring-[#01a982] focus:ring-opacity-50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Panel - Always visible */}
            <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Selected Documents</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {filteredDocuments.length > 0
                    ? `${filteredDocuments.length} document${filteredDocuments.length > 1 ? 's' : ''} selected`
                    : 'No documents selected'
                  }
                </p>
              </div>

              {/* Documents List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {filteredDocuments.map((entry) => (
                      <div key={entry.guid} className="p-2 group relative flex items-start">
                        {/* Document Icon */}
                        <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 break-words">{entry.filename}</div>
                          {/* <div className="text-xs text-gray-500 mt-1">ID: {entry.guid.substring(0, 8)}...</div> */}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => {
                            const updatedDocuments = selectedDocuments.map(doc =>
                              doc.guid === entry.guid
                                ? { ...doc, selected: false }
                                : doc
                            );
                            setSelectedDocuments(updatedDocuments);
                          }}
                          className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">No documents selected</p>
                    <p className="text-xs text-gray-400 mt-2">Select documents from the dropdown above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}