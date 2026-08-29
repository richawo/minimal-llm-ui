// Define the DocumentEntry type
type DocumentEntry = {
  filename: string;
  guid: string;
  selected?: boolean;
};

interface Window {
  setDocumentValues?: (filenameOrDocuments: string | DocumentEntry[] | DocumentEntry, guid?: string) => void;
}
