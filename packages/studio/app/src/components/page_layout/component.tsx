import type { JSX, ReactNode } from "react";
import type { Model } from "../../application/query.ts";
import { useMessenger } from "../../context/messenger.ts";
import { Page, router } from "~router";
import style from "./style.css" with { type: "css" };
import { StyleSheet } from "~component";
import Navigation from "./navigation/component.tsx";

export interface PageLayoutProps {
  models: Model[];
  children?: ReactNode;
}

export default function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children, models } = props;
  const messenger = useMessenger();

  return (
    <>
      <StyleSheet href="page-layout" precedence="">{style}</StyleSheet>

      <body data-component="page-layout">
        <header>
          <a href={router.resolve(Page.Home, {})}>
            {messenger.message({ type: "page-title", page: "Home" })}
          </a>
        </header>

        <aside data-navigation>
          <Navigation models={models} />
        </aside>

        <main>
          {children}
        </main>
      </body>
    </>
  );
}
