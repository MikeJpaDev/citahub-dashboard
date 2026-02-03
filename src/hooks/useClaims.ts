import { useQuery } from "@tanstack/react-query";
import type { Claim } from "@/types/claim";

const fetchClaims = async (): Promise<Claim[]> => {
  const response = await fetch("https://n8n.guajiritos.com/webhook/claim/report");
  if (!response.ok) {
    throw new Error("Error al obtener los datos");
  }
  return response.json();
};

export const useClaims = () => {
  return useQuery({
    queryKey: ["claims"],
    queryFn: fetchClaims,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
