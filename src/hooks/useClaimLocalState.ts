import { useState, useCallback } from "react";

export type ClaimStatus = "En Espera" | "En Proceso" | "Completado";

interface ClaimLocalData {
  numeroCita: string;
  completado: boolean;
}

type LocalStateMap = Record<number, ClaimLocalData>;

const STORAGE_KEY = "claim_local_state";

const loadFromStorage = (): LocalStateMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (map: LocalStateMap) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const getClaimStatus = (data?: ClaimLocalData): ClaimStatus => {
  if (!data) return "En Espera";
  if (data.completado) return "Completado";
  if (data.numeroCita.trim()) return "En Proceso";
  return "En Espera";
};

export const useClaimLocalState = () => {
  const [localState, setLocalState] = useState<LocalStateMap>(loadFromStorage);

  const setNumeroCita = useCallback((claimId: number, value: string) => {
    setLocalState((prev) => {
      const next = {
        ...prev,
        [claimId]: {
          numeroCita: value,
          completado: prev[claimId]?.completado ?? false,
        },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setCompletado = useCallback((claimId: number) => {
    setLocalState((prev) => {
      const next = {
        ...prev,
        [claimId]: {
          numeroCita: prev[claimId]?.numeroCita ?? "",
          completado: true,
        },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const getData = useCallback(
    (claimId: number): ClaimLocalData => {
      return localState[claimId] ?? { numeroCita: "", completado: false };
    },
    [localState]
  );

  return { getData, setNumeroCita, setCompletado };
};
