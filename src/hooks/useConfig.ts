import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConfiguracionClaim } from "@/types/config";

const BASE_URL_GUAJIRITOS = import.meta.env.VITE_BASE_URL_GUAJIRITOS;

const fetchConfig = async (): Promise<ConfiguracionClaim> => {
    const response = await fetch(BASE_URL_GUAJIRITOS + "/claim/config", { method: "GET" });
    if (!response.ok) {
        throw new Error("Error al obtener la configuración del sistema");
    }
    const data = await response.json();
    // n8n may return an array; take first item
    return Array.isArray(data) ? data[0] : data;
};

const saveConfig = async (config: ConfiguracionClaim): Promise<ConfiguracionClaim> => {
    const response = await fetch(BASE_URL_GUAJIRITOS + "/claim/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });
    if (!response.ok) {
        throw new Error("Error al guardar la configuración");
    }
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
};

export const useConfig = () => {
    const queryClient = useQueryClient();

    const query = useQuery<ConfiguracionClaim>({
        queryKey: ["config"],
        queryFn: fetchConfig,
        staleTime: 60_000,
        retry: 2,
    });

    const mutation = useMutation({
        mutationFn: saveConfig,
        onSuccess: (updated) => {
            queryClient.setQueryData(["config"], updated);
            toast.success("Configuración guardada correctamente");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Error al guardar la configuración");
        },
    });

    return {
        config: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        saveConfig: mutation.mutate,
        isSaving: mutation.isPending,
    };
};
