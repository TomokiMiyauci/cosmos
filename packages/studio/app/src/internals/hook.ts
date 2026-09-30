import { createContext, use } from "react";
import type { EntrySummary, Queries } from "../application/query.ts";

export const QueriesContext = createContext<Queries | null>(null);

export function useQuerirs(): Queries {
  const context = use(QueriesContext);

  if (!context) throw new Error("wrap by QueriesContext");

  return context;
}

export type { EntrySummary, Queries };
