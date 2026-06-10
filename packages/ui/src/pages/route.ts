import type { Routes } from "./type.ts";

export const routes = {
  resources: "/resources/:name" as const,
  home: "/" as const,
} satisfies Routes;
