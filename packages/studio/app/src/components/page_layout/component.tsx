import type { JSX, ReactNode } from "react";
import type { Model } from "../../application/query.ts";
// import { useMessenger } from "../../context/messenger.ts";
import style from "./style.css" with { type: "css" };
import { StyleSheet } from "~component";
import Navigation from "./navigation/component.tsx";
import {
  DisclosureConsumer,
  DisclosureProvider,
} from "./disclosure/component.tsx";
import Header from "./header/component.tsx";

export interface PageLayoutProps {
  models: Model[];
  children?: ReactNode;
}

export default function PageLayout(props: PageLayoutProps): JSX.Element {
  const { children, models } = props;
  // const messenger = useMessenger();

  return (
    <>
      <StyleSheet href="page-layout" precedence="">{style}</StyleSheet>

      <body data-component="page-layout">
        <DisclosureProvider>
          <div data-component="header-aria">
            <Header />
          </div>

          <DisclosureConsumer>
            {({ isOpen, id }) => {
              return (
                <div data-component="aside" id={id} data-open={isOpen}>
                  <Aside models={models} />
                </div>
              );
            }}
          </DisclosureConsumer>
        </DisclosureProvider>

        <main>
          {children}
        </main>
      </body>
    </>
  );
}

function Aside({ models }: { models: Model[] }): JSX.Element {
  return (
    <aside>
      <Navigation models={models} />
    </aside>
  );
}
