import { type JSX, Suspense, use } from "react";
import type { CmsService, Identity } from "../type.ts";
import { Page, resolvePath } from "../router.ts";

export interface ResourcePageProps {
  resourceId: string;
  service: CmsService;
}

export default function ResourcePage(props: ResourcePageProps): JSX.Element {
  const { resourceId, service } = props;

  const promise = service.findContents({ resource: resourceId });

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

function MainPage(props: { promise: Promise<Identity[]> }): JSX.Element {
  const result = use(props.promise);

  return (
    <div>
      <ul>
        {result.map((value) => {
          const href = resolvePath(Page.Content, { id: value.id });

          return (
            <li key={value.id}>
              <a href={href}>{value.id}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
