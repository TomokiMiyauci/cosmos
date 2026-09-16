import { router } from "./pages/route.ts";
import type { ExtractParams, Routes } from "./pages/type.ts";
import { Page } from "./pages/symbol.ts";
import type { ContentCreatePageProps } from "./pages/content_creation.tsx";
import type { EntryPageProps } from "./pages/content.tsx";
import { views } from "./pages/view.ts";
import type { EntriesPageProps } from "./pages/resource.tsx";
import type { Queries } from "./application/query.ts";
import type { Services } from "./application/service.ts";
import { EnMessenger } from "./messenger.ts";
import {
  getStaticProps as getLayoutStaticProps,
  type LayoutProps,
} from "./html.tsx";

export class Router {
  constructor(
    private queries: Queries,
    private services: Services,
  ) {
  }
  async route(url: URL): Promise<RouteResult> {
    const layoutProps = await getLayoutStaticProps(this.queries.model);
    const result = router.match(url.href);

    if (!result) {
      return {
        type: Page.NotFound,
        data: layoutProps,
      };
    }

    const props = {
      queries: this.queries,
      services: this.services,
      url,
      messenger: new EnMessenger(),
    };

    switch (result.key) {
      case Page.Home: {
        return { type: Page.Home, data: layoutProps };
      }
      case Page.EntryList: {
        const staticProps = await views[result.key].getStaticProps({
          ...props,
          params: result.params,
        });

        if (!staticProps) {
          return {
            type: Page.NotFound,
            data: {
              ...layoutProps,
            },
          };
        }

        return {
          type: Page.EntryList,
          data: { ...staticProps, ...layoutProps },
        };
      }
      case Page.EntryCreation: {
        const staticProps = await views[result.key].getStaticProps({
          ...props,
          params: result.params,
        });

        if (!staticProps) {
          return {
            type: Page.NotFound,
            data: {
              ...layoutProps,
            },
          };
        }

        return {
          type: Page.EntryCreation,
          data: {
            ...staticProps,
            ...layoutProps,
          },
        };
      }
      case Page.Entry: {
        const staticProps = await views[result.key].getStaticProps({
          ...props,
          params: result.params,
        });

        if (!staticProps) {
          return {
            type: Page.NotFound,
            data: {
              ...layoutProps,
            },
          };
        }

        return {
          type: Page.Entry,
          data: {
            ...staticProps,
            ...layoutProps,
          },
        };
      }
    }
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

export type RouteResult = {
  type: Page.EntryCreation;
  data: ContentCreatePageProps & LayoutProps;
} | {
  type: Page.Entry;
  data: EntryPageProps & LayoutProps;
} | {
  type: Page.EntryList;
  data: EntriesPageProps & LayoutProps;
} | {
  type: Page.NotFound;
  data: LayoutProps;
} | {
  type: Page.Home;
  data: LayoutProps;
};
