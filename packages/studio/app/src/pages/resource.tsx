import type { JSX } from "react";
import { Page, router } from "~router";
import { resolveEntryCreation } from "./route.ts";

export interface EntriesPageProps {
  summaries: EntrySummary[];
  modelId: string;
}

export interface EntrySummary {
  id: string;
  title: string;
}

export default function EntriesPage(props: EntriesPageProps): JSX.Element {
  const { summaries, modelId } = props;

  return (
    <div>
      <a href={resolveEntryCreation(modelId)}>
        Create
      </a>

      <ul>
        {summaries.map(({ id, title }) => {
          const href = router.resolve(Page.Entry, { id });

          return (
            <li key={id}>
              <a href={href}>{title}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
