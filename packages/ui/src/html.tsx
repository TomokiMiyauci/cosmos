import { type JSX, type ReactNode, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import type { Model, Queries } from "./application/query.ts";
import { useMessenger } from "./context/messenger.ts";

export interface HtmlProps {
  route: RouteResult;
  children?: ReactNode;
  queries: Queries;
}

export default function Html(props: HtmlProps): JSX.Element {
  const { children, queries } = props;

  const messenger = useMessenger();

  const modelsPromise = queries.model.list();

  return (
    <html>
      <head></head>

      <body>
        <header>
          <a href={resolvePath(Page.Home)}>
            {messenger.message({ type: "page-title", page: "Home" })}
          </a>
        </header>

        <Suspense>
          <Aside promise={modelsPromise} />
        </Suspense>

        <aside>
          <h2>
            <a href={resolvePath(Page.Assets)}>
              {messenger.message({ type: "page-title", page: "Home" })}
            </a>
          </h2>
        </aside>

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

function Aside(
  props: { promise: Promise<Model[]> },
): JSX.Element {
  const { promise } = props;

  const identifies = use(promise);
  const messenger = useMessenger();

  return (
    <aside>
      <h2>{messenger.message({ type: "page-title", page: "Entry" })}</h2>

      <ul>
        {identifies.map(({ id, title }) => {
          return (
            <li key={id}>
              <a href={resolvePath(Page.Resource, { id })}>{title}</a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
