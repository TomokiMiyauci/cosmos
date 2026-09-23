import type { JSX } from "react";
import { Page, router } from "~router";
import { resolveEntryCreation } from "./route.ts";
import type { EntrySummary } from "../application/query.ts";

export interface EntriesPageProps {
  summaries: EntrySummary[];
  modelId: string;
}

export default function EntriesPage(props: EntriesPageProps): JSX.Element {
  const { summaries, modelId } = props;

  return (
    <div>
      <a href={resolveEntryCreation(modelId)}>
        Create
      </a>

      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Updated At</th>
          </tr>
        </thead>

        <tbody>
          {summaries.map(({ id, title, updatedAt }) => {
            const href = router.resolve(Page.Entry, { id });

            return (
              <tr key={id}>
                <td>
                  <a href={href}>{title}</a>
                </td>
                <td>
                  {updatedAt.toString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
