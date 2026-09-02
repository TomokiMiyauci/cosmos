import { routes } from "./pages/route.ts";
import type { ExtractParams, Routes } from "./pages/type.ts";
import { mapValues } from "@std/collections/map-values";
import { filterValues } from "@std/collections/filter-values";
import { Page } from "./pages/symbol.ts";
import type { ContentCreatePageProps } from "./pages/content_creation.tsx";
import type { ContentPageProps } from "./pages/content.tsx";
import { views } from "./pages/view.ts";
import type { CmsService } from "@cosmos/ui";
import type { ResourcePageProps } from "./pages/resource.tsx";
import type { Router as R } from "./type.ts";
import type { Queries } from "./application/query.ts";
import type { Services } from "./application/service.ts";

class DefaultRouter implements R {
  redirect(to: string): void {
    globalThis.location.href = to;
  }
}

export class Router {
  #routes: Record<keyof Routes, URLPattern>;
  #router: R = new DefaultRouter();

  constructor(
    private service: CmsService,
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
            service: this.service,
            router: this.#router,
            queries: this.queries,
            services: this.services,
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
  type: Page.ContentCreation;
  data: ContentCreatePageProps;
} | {
  type: Page.Content;
  data: ContentPageProps;
} | {
  type: Page.Resource;
  data: ResourcePageProps;
} | {
  type: Page.NotFound;
} | {
  type: Page.Home;
} | {
  type: Page.Assets;
};
