import type { JSX } from "react";
import { Page, resolvePath } from "../router.ts";

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
      {/* <h1>{resource.id}</h1> */}

      <a href={resolvePath(Page.ContentCreation, { id: modelId })}>
        Create
      </a>

      <ul>
        {summaries.map(({ id, title }) => {
          const href = resolvePath(Page.Content, { id });

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
