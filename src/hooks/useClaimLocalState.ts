import { useState, useCallback } from "react";
import type { Claim } from "@/types/claim";

export type ClaimStatus = "En Espera" | "En Proceso" | "Completado";

type CompletadoMap = Record<number, boolean>;

const STORAGE_KEY = "claim_completado_state";

const loadFromStorage = (): CompletadoMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (map: CompletadoMap) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const getClaimStatus = (claim: Claim, completado: boolean): ClaimStatus => {
  if (completado) return "Completado";
  if (claim.Numero_Cita && String(claim.Numero_Cita).trim()) return "En Proceso";
  return "En Espera";
};

export const useClaimLocalState = () => {
  const [completadoMap, setCompletadoMap] = useState<CompletadoMap>(loadFromStorage);

  const setCompletado = useCallback((claimId: number) => {
    setCompletadoMap((prev) => {
      const next = { ...prev, [claimId]: true };
      saveToStorage(next);
      return next;
    });
  }, []);

  const isCompletado = useCallback(
    (claimId: number) => completadoMap[claimId] ?? false,
    [completadoMap]
  );

  return { isCompletado, setCompletado };
};
