import { routes } from "./pages/route.ts";
import type { ExtractParams, Routes } from "./pages/type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";
import { Page } from "./pages/symbol.ts";
import type { ContentCreatePageProps } from "./pages/content_creation.tsx";
import type { EntryPageProps } from "./pages/content.tsx";
import { views } from "./pages/view.ts";
import type { EntriesPageProps } from "./pages/resource.tsx";
import type { Queries } from "./application/query.ts";
import type { Services } from "./application/service.ts";
import { EnMessenger } from "./messenger.ts";

export class Router {
  #routes: Record<keyof Routes, URLPattern>;

  constructor(
    private queries: Queries,
    private services: Services,
  ) {
    this.#routes = mapValues(
      routes,
      (init) => new URLPattern({ pathname: init }),
    );
  }
  async route(url: URL): Promise<RouteResult> {
    for (const [type, pattern] of Object.entries(this.#routes)) {
      const result = pattern.exec(url);

      if (result) {
        const entry = views[type];
        const decodedParams = mapValues(
          filterValues(
            result.pathname.groups,
            (value): value is string => value !== undefined,
          ) as Record<string, string>,
          decodeURIComponent,
        );

        if (entry.getStaticProps) {
          const data = await entry.getStaticProps({
            params: decodedParams,
            queries: this.queries,
            services: this.services,
            url,
            messenger: new EnMessenger(),
          });

          if (!data) {
            return {
              type: Page.NotFound,
            };
          }

          return {
            data,
            type: Number(type),
          };
        }

        return {
          type: Number(type),
        };
      }
    }

    return {
      type: Page.NotFound,
    };
  }
}

export interface RouteResultt {
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

export type RouteResult = {
  type: Page.EntryCreation;
  data: ContentCreatePageProps;
} | {
  type: Page.Entry;
  data: EntryPageProps;
} | {
  type: Page.EntryList;
  data: EntriesPageProps;
} | {
  type: Page.NotFound;
} | {
  type: Page.Home;
};
