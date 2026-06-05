import { routes } from "./pages/route.ts";
import type { Routes } from "./pages/type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";

export class Router {
  #routes: Record<keyof Routes, URLPattern>;

  constructor() {
    this.#routes = mapValues(routes, (init) => new URLPattern(init));
  }
  route(url: URL): RouteResult {
    for (const [type, pattern] of Object.entries(this.#routes)) {
      const result = pattern.exec(url);

      if (result) {
        const params = filterValues(
          result.pathname.groups,
          (value): value is string => value !== undefined,
        ) as Record<string, string>;

        return {
          type: type as keyof Routes,
          params,
        };
      }
    }

    return {
      type: "not-found",
      params: {},
    };
  }
}

export interface RouteResult {
  type: "not-found" | "home" | "resources";
  params: Record<string, string>;
}
