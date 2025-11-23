import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { RetirementPlan } from "@/lib/types/retirement";

interface UseRetirementDataReturn {
  retirements: RetirementPlan[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch retirement planning data from IndexedDB
 * Uses Dexie's live query for reactive updates
 */
export function useRetirementData(): UseRetirementDataReturn {
  const result = useLiveQuery(
    async () => {
      try {
        const data = await db.retirements
          .orderBy("createdAt")
          .reverse()
          .toArray();
        return { data, error: null };
      } catch (error) {
        return {
          data: [],
          error:
            error instanceof Error
              ? error
              : new Error("Failed to fetch retirement data"),
        };
      }
    },
    [],
    { data: undefined, error: null }
  );

  return useMemo(
    () => ({
      retirements: result.data ?? [],
      isLoading: result.data === undefined,
      error: result.error,
    }),
    [result]
  );
}
