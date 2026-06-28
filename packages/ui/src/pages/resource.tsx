import { type JSX, Suspense, use } from "react";
import type { CmsService, Summary } from "../type.ts";
import { Page, resolvePath } from "../router.ts";

export interface ResourcePageProps {
  resourceId: string;
  service: CmsService;
}

export default function ResourcePage(props: ResourcePageProps): JSX.Element {
  const { resourceId, service } = props;

  const promise = service.findSummaries({ resource: resourceId });

  return (
    <div>
      <h1>{resourceId}</h1>

      <a href={resolvePath(Page.ContentCreation, { id: resourceId })}>Create</a>

      <Suspense>
        <MainPage promise={promise} />
      </Suspense>
    </div>
  );
}

function MainPage(props: { promise: Promise<Summary[]> }): JSX.Element {
  const result = use(props.promise);

  return (
    <div>
      <ul>
        {result.map(({ id, name }) => {
          const href = resolvePath(Page.Content, { id });

          return (
            <li key={id}>
              <a href={href}>{name}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
