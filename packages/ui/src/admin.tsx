import { type JSX, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import type { CmsService, Identity } from "./type.ts";
import { views } from "./pages/view.ts";
import type { TranslationService } from "./translation.ts";

export interface AdminProps {
  route: RouteResult;
  service: CmsService;
  translation: TranslationService;
}

export function Admin(props: AdminProps): JSX.Element {
  const { service, translation } = props;

  const resourcesPromise = service.findResources();

  return (
    <html>
      <head></head>
      <body>
        <header>
          <a href={resolvePath(Page.Home)}>
            {translation.translate("page.home.title")}
          </a>
        </header>

        <Suspense>
          <Aside promise={resourcesPromise} translation={translation} />
        </Suspense>

        <aside>
          <h2>
            <a href={resolvePath(Page.Assets)}>
              {translation.translate("page.assets.title")}
            </a>
          </h2>
        </aside>
        <main>
          <PageMatcher {...props} />
        </main>
      </body>
    </html>
  );
}

function Aside(
  props: { promise: Promise<Identity[]>; translation: TranslationService },
): JSX.Element {
  const { promise, translation } = props;

  const identifies = use(promise);

  return (
    <aside>
      <h2>{translation.translate("page.resources.title")}</h2>

      <ul>
        {identifies.map(({ id }) => {
          return (
            <li key={id}>
              <a href={resolvePath(Page.Resource, { id })}>{id}</a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function PageMatcher(props: AdminProps): JSX.Element {
  const { route } = props;

  switch (route.type) {
    case Page.ContentCreation: {
      return views[route.type].component(route.data);
    }
    case Page.Content: {
      return views[route.type].component(route.data);
    }
    case Page.Contents: {
      return views[route.type].component(route.data);
    }
    case Page.Resource: {
      return views[route.type].component(route.data);
    }
    case Page.NotFound: {
      return views[route.type].component();
    }
    case Page.Home: {
      return views[route.type].component();
    }
    case Page.Assets: {
      return views[route.type].component();
    }
  }
}
