import type { Routes } from "./type.ts";

export const routes = {
  resources: {
    pathname: "/resources/:name",
  },
  home: {
    pathname: "/",
  },
} satisfies Routes;
