import { type JSX, Suspense, use } from "react";
import { Page, resolvePath } from "../router.ts";
import type { CmsService, Summary } from "../type.ts";

export interface ContentsPageProps {
  service: CmsService;
}

export default function ContentsPage(props: ContentsPageProps): JSX.Element {
  const { service } = props;

  const promise = service.findSummaries();

  return (
    <div>
      <h1>All Contents</h1>

      <Suspense>
        <PageInner promise={promise} />
      </Suspense>
    </div>
  );
}

function PageInner(props: { promise: Promise<Summary[]> }): JSX.Element {
  const data = use(props.promise);

  return (
    <ul>
      {data.map(({ id, name }) => {
        const href = resolvePath(Page.Content, { id });

        return (
          <li key={id}>
            <a href={href}>{name}</a>
          </li>
        );
      })}
    </ul>
  );
}
