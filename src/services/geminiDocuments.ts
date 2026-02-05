const GEMINI_API_KEY = "AIzaSyAdghVSBqAoVec0YHu21K2QZ-Eri-5nvfc";
const FILE_SEARCH_STORE_ID = "fileSearchStores/bbdd-wqe6r41m1ihz";
const BASE_URL = "https://generativelanguage.googleapis.com";

export interface GeminiDocument {
  name: string;
  displayName: string;
  uploadedAt: string;
  sizeBytes: number;
}

interface CustomMetadata {
  key: string;
  stringValue: string;
}

interface GeminiDocumentResponse {
  name: string;
  customMetadata?: CustomMetadata[];
  sizeBytes?: string;
}

// Step 1: Upload file binary to Gemini
export const uploadFileToGemini = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/upload/v1beta/files?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload error:", errorText);
    throw new Error("Error al subir el archivo a Gemini");
  }

  const data = await response.json();
  return data.file?.name || data.name;
};

// Step 2: Index file in File Search Store
export const indexFileInStore = async (
  fileName: string,
  displayName: string
): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const response = await fetch(
    `${BASE_URL}/v1beta/${FILE_SEARCH_STORE_ID}:importFile?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: fileName,
        customMetadata: [
          {
            key: "nombre_archivo",
            stringValue: displayName,
          },
          {
            key: "fecha_subida",
            stringValue: today,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Index error:", errorText);
    throw new Error("Error al indexar el archivo");
  }
};

// List documents from File Search Store
export const listDocuments = async (): Promise<GeminiDocument[]> => {
  const response = await fetch(
    `${BASE_URL}/v1beta/${FILE_SEARCH_STORE_ID}/documents?key=${GEMINI_API_KEY}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("List error:", errorText);
    throw new Error("Error al listar documentos");
  }

  const data = await response.json();
  const documents: GeminiDocumentResponse[] = data.documents || [];

  return documents.map((doc) => {
    const nombreArchivo = doc.customMetadata?.find(
      (m) => m.key === "nombre_archivo"
    )?.stringValue;
    const fechaSubida = doc.customMetadata?.find(
      (m) => m.key === "fecha_subida"
    )?.stringValue;

    return {
      name: doc.name,
      displayName: nombreArchivo || "Sin nombre",
      uploadedAt: fechaSubida || "Fecha desconocida",
      sizeBytes: parseInt(doc.sizeBytes || "0", 10),
    };
  });
};

// Delete document from File Search Store
export const deleteDocument = async (documentName: string): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/v1beta/${documentName}?force=true&key=${GEMINI_API_KEY}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete error:", errorText);
    throw new Error("Error al eliminar el documento");
  }
};

// Full upload flow: upload + index
export const uploadDocument = async (file: File): Promise<void> => {
  const fileName = await uploadFileToGemini(file);
  await indexFileInStore(fileName, file.name);
};
