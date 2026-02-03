import { useState, useEffect } from "react";
import type { Document } from "@/types/claim";

const STORAGE_KEY = "dashboard_documents";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (docs: Document[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    setDocuments(docs);
  };

  const addDocument = (doc: Omit<Document, "id" | "createdAt">) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveToStorage([...documents, newDoc]);
  };

  const updateDocument = (id: string, doc: Partial<Document>) => {
    const updated = documents.map((d) =>
      d.id === id ? { ...d, ...doc } : d
    );
    saveToStorage(updated);
  };

  const deleteDocument = (id: string) => {
    const filtered = documents.filter((d) => d.id !== id);
    saveToStorage(filtered);
  };

  return {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
  };
};
