import { type JSX, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import type { CmsService, Identity } from "./type.ts";
import { views } from "./pages/view.ts";

export interface AdminProps {
  route: RouteResult;
  service: CmsService;
}

export function Admin(props: AdminProps): JSX.Element {
  const resourcesPromise = props.service.findResources();

  return (
    <html>
      <head></head>
      <body>
        <header>
          <a href={resolvePath(Page.Home)}>Home</a>
        </header>

        <Suspense>
          <Aside promise={resourcesPromise} />
        </Suspense>

        <aside>
          <h2>
            <a href={resolvePath(Page.Assets)}>
              Assets
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

function Aside(props: { promise: Promise<Identity[]> }): JSX.Element {
  const { promise } = props;

  const identifies = use(promise);

  return (
    <aside>
      <h2>Resources</h2>

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
