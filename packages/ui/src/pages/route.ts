import type { Routes } from "./type.ts";
import { Page } from "./symbol.ts";

export const routes = {
  [Page.Resources]: "/resources/:name" as const,
  [Page.Home]: "/" as const,
  [Page.Resource]: "/contents/:id" as const,
} satisfies Routes;
