import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useMemo } from "react";

export function useCashflowData() {
  const cashflows = useLiveQuery(async () => {
    try {
      const data = await db.cashFlows.toArray();
      return { error: null, data } as const;
    } catch (error) {
      return { error: error as Error, data: null } as const;
    }
  }, []);

  const { data, error } = useMemo(() => {
    if (cashflows === undefined) return { data: undefined, error: null };
    return { data: cashflows.data, error: cashflows.error };
  }, [cashflows]);

  return {
    cashflows: data || [],
    isLoading: cashflows === undefined,
    error,
  };
}
