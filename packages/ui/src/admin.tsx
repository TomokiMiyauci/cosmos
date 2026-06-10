import type { JSX } from "react";
import { resolvePath, type RouteResult } from "./router.ts";
import { views } from "./pages/view.ts";
import type { ParsedConfig } from "./pages/type.ts";

export interface AdminProps {
  basePath: string;
  url: URL;
  config: ParsedConfig;
  route: RouteResult;
}

export function Admin(props: AdminProps): JSX.Element {
  const { config } = props;

  return (
    <html>
      <head></head>
      <body>
        <header>
          <a href={resolvePath("home")}>Home</a>
        </header>
        <aside>
          <h2>Resources</h2>

          <ul>
            {Object.entries(config.value.resources).map(([name]) => {
              return (
                <li key={name}>
                  <a href={resolvePath("resources", { name })}>{name}</a>
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
