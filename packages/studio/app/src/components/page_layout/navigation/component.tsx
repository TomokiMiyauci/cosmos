import type { JSX } from "react";
import { useMessenger } from "../../../context/messenger.ts";
import { resolveEntryListByModel } from "../../../pages/route.ts";
import type { Model } from "../../../application/query.ts";
import style from "./style.css" with { type: "css" };
import StyleSheet from "~util";

export interface NavigationProps {
  models: Model[];
}

export default function Navigation(props: NavigationProps): JSX.Element {
  const { models } = props;

  const messenger = useMessenger();

  return (
    <>
      <StyleSheet href="navigation" precedence="">{style}</StyleSheet>

      <nav data-component="navigation">
        <h2 data-title>
          {messenger.message({ type: "page-title", page: "Entry" })}
        </h2>

        <ul data-list>
          {models.map(({ id, title }) => {
            return (
              <li data-item key={id}>
                <a href={resolveEntryListByModel(id)}>{title}</a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
