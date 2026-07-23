import { type JSX, type ReactNode, Suspense, use } from "react";
import { Page, resolvePath, type RouteResult } from "./router.ts";
import type { CmsService, Identity } from "./type.ts";
import type { TranslationService } from "./translation.ts";

export interface HtmlProps {
  route: RouteResult;
  service: CmsService;
  translation: TranslationService;
  children?: ReactNode;
}

export default function Html(props: HtmlProps): JSX.Element {
  const { service, translation, children } = props;

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
          {children}
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
