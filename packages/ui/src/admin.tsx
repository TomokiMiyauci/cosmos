import type { JSX } from "react";
import type { Config } from "@cosmos/core";
import type { RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";

export interface AdminProps {
  basePath: string;
  url: URL;
  config: Config;
  route: RouteResult;
}

export function Admin(props: AdminProps): JSX.Element {
  const { config } = props;

  return (
    <html>
      <head></head>
      <body>
        <header>
          <a href="/">Home</a>
        </header>
        <aside>
          <h2>Resources</h2>

          <ul>
            {Object.entries(config.resources).map(([name]) => {
              return (
                <li key={name}>
                  <a href={`/resources/${name}`}>{name}</a>
                </li>
              );
            })}
          </ul>
        </aside>

        <main>
          <PageMatcher {...props} />
        </main>
      </body>
    </html>
  );
}

function PageMatcher(props: AdminProps): JSX.Element {
  const { route, config } = props;

  return views[route.type]({ config, params: route.params });
}
