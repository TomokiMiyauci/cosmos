import { routes } from "./pages/route.ts";
import type { ExtractParams, Routes } from "./pages/type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";

export class Router {
  #routes: Record<keyof Routes, URLPattern>;

  constructor() {
    this.#routes = mapValues(
      routes,
      (init) => new URLPattern({ pathname: init }),
    );
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

export function createResolve<T extends Routes>(
  routes: T,
): <X extends keyof T, Y extends ExtractParams<T[X]>>(
  key: X,
  ...params: IsNever<Y> extends true ? [] : [Y]
) => string {
  return (key, ...params) => {
    const pattern = routes[key];

    if (typeof pattern !== "string") throw new Error();

    let url: string = pattern;

    if (params) {
      for (const [pKey, pValue] of Object.entries(params)) {
        url = url.replace(`:${pKey}`, pValue as unknown as string);
      }
    }
    return url;
  };
}

type IsNever<T> = [T] extends [never] ? true : false;
