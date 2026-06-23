import { type JSX, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";
import type { CmsService, Identity } from "./type.ts";

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
  const { route, service } = props;

  return views[route.type]({ params: route.params, service });
}
