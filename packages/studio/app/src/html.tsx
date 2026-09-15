import type { JSX, ReactNode } from "react";
import { Page, resolvePath } from "./router.ts";
import type { Model, ModelQuery } from "./application/query.ts";
import { useMessenger } from "./context/messenger.ts";
import { resolveEntryListByModel } from "./pages/route.ts";

export interface LayoutProps {
  models: Model[];
}

export async function getStaticProps(query: ModelQuery): Promise<LayoutProps> {
  const models = await query.list();

  return { models };
}

export interface HtmlProps extends LayoutProps {
  children?: ReactNode;
}

export default function Html(props: HtmlProps): JSX.Element {
  const { children, models } = props;

  const messenger = useMessenger();

  return (
    <html>
      <head></head>

      <body>
        <header>
          <a href={resolvePath(Page.Home)}>
            {messenger.message({ type: "page-title", page: "Home" })}
          </a>
        </header>

        <Aside models={models} />

        <aside>
          <h2>
            {
              /* <a href={resolvePath(Page.Assets)}>
              {messenger.message({ type: "page-title", page: "Home" })}
            </a> */
            }
          </h2>
        </aside>

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

interface AsideProps {
  models: Model[];
}

function Aside(props: AsideProps): JSX.Element {
  const { models } = props;

  const messenger = useMessenger();

  return (
    <aside>
      <h2>{messenger.message({ type: "page-title", page: "Entry" })}</h2>

      <ul>
        {models.map(({ id, title }) => {
          return (
            <li key={id}>
              <a href={resolveEntryListByModel(id)}>{title}</a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
