import { type JSX, type ReactNode, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import type { TranslationService } from "./translation.ts";
import type { Model, Queries } from "./application/query.ts";

export interface HtmlProps {
  route: RouteResult;
  translation: TranslationService;
  children?: ReactNode;
  queries: Queries;
}

export default function Html(props: HtmlProps): JSX.Element {
  const { translation, children, queries } = props;

  const modelsPromise = queries.model.list();

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
          <Aside promise={modelsPromise} translation={translation} />
        </Suspense>

        <aside>
          <h2>
            <a href={resolvePath(Page.Assets)}>
              {translation.translate("page.assets.title")}
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
  props: { promise: Promise<Model[]>; translation: TranslationService },
): JSX.Element {
  const { promise, translation } = props;

  const identifies = use(promise);

  return (
    <aside>
      <h2>{translation.translate("page.resources.title")}</h2>

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
