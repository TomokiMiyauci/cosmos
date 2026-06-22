import type { Routes } from "./type.ts";
import { Page } from "./symbol.ts";

export const routes = {
  [Page.Resource]: "/resources/:id" as const,
  [Page.Home]: "/" as const,
  [Page.Contents]: "/contents",
  [Page.ContentCreation]: "/contents/new" as const,
  [Page.Content]: "/contents/:id" as const,
} satisfies Routes;
