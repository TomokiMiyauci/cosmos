import { routes } from "./pages/route.ts";
import type { ExtractParams, Routes } from "./pages/type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";
import { Page } from "./pages/symbol.ts";

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
        const decodedParams = mapValues(
          filterValues(
            result.pathname.groups,
            (value): value is string => value !== undefined,
          ) as Record<string, string>,
          decodeURIComponent,
        );

        return {
          type: type as Page,
          params: decodedParams,
        };
      }
    }

    return {
      type: Page.NotFound,
      params: {},
    };
  }
}

export interface RouteResult {
  type: Page;
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
      for (const object of params) {
        for (const [pKey, pValue] of Object.entries(object)) {
          url = url.replace(`:${pKey}`, pValue as unknown as string);
        }
      }
    }
    return url;
  };
}

type IsNever<T> = [T] extends [never] ? true : false;

export const resolvePath = createResolve(routes);
export { Page };
