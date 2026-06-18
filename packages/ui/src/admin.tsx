import type { JSX } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";
import type { Service } from "./type.ts";

export interface AdminProps {
  route: RouteResult;
  service: Service;
}

export function Admin(props: AdminProps): JSX.Element {
  return (
    <html>
      <head></head>
      <body>
        <header>
          <a href={resolvePath(Page.Home)}>Home</a>
        </header>
        <aside>
          <h2>Resources</h2>
        </aside>

        <main>
          <PageMatcher {...props} />
        </main>
      </body>
    </html>
  );
}

function PageMatcher(props: AdminProps): JSX.Element {
  const { route, service } = props;

  return views[route.type]({ params: route.params, service });
}
