import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  type GeminiDocument,
} from "@/services/geminiDocuments";
import { toast } from "sonner";

export const useGeminiDocuments = () => {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["gemini-documents"],
    queryFn: listDocuments,
    refetchInterval: 30000,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success("Documento subido correctamente");
      queryClient.invalidateQueries({ queryKey: ["gemini-documents"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir el documento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success("Documento eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["gemini-documents"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el documento");
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export type { GeminiDocument };
