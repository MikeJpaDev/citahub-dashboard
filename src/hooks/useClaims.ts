import { useQuery } from "@tanstack/react-query";
import type { Claim } from "@/types/claim";

const fetchClaims = async (): Promise<Claim[]> => {
  const BASE_URL_GUAJIRITOS = import.meta.env.VITE_BASE_URL_GUAJIRITOS;
  const response = await fetch(`${ BASE_URL_GUAJIRITOS }/claim/report`);
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
