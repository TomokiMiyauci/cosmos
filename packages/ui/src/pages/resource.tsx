import { type JSX, Suspense, use } from "react";
import type { PageProps } from "./type.ts";
import type { Identity } from "../type.ts";
import { Page, resolvePath } from "../router.ts";

export default function ResourcePage(props: PageProps): JSX.Element {
  const { service, params } = props;
  const id = params.id;

  if (typeof id !== "string") return <></>;

  const promise = service.findContents({ resource: id });

  return (
    <div>
      <h1>{id}</h1>

      <a href={resolvePath(Page.ContentCreation, { id })}>Create</a>

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
