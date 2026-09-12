import type { Routes } from "./type.ts";
import { Page } from "./symbol.ts";
import { resolvePath } from "../router.ts";

export const routes = {
  [Page.EntryList]: "/entries" as const,
  [Page.Home]: "/" as const,
  [Page.EntryCreation]: "/entries/new" as const,
  [Page.Entry]: "/entries/:id" as const,
} satisfies Routes;

export function resolveEntryListByModel(modelId: string): string {
  return resolvePath(Page.EntryList) + "?" + `model=${modelId}`;
}

export function resolveEntryCreation(modelId: string): string {
  return resolvePath(Page.EntryCreation) + "?" + `model=${modelId}`;
}
