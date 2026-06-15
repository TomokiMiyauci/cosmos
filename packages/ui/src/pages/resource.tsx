import { type JSX, Suspense, use, useState } from "react";
import type { PageProps } from "./type.ts";
import type { Node } from "@cosmos/core";
import type { Content } from "@cosmos/client";
import Field from "../fields/field.tsx";

export default function ContentPage(
  props: PageProps,
): JSX.Element {
  const { params, client } = props;

  if (typeof params.id !== "string") return <></>;

  const id = params.id;

  const promise = client.content.get(id);

  function update(node: Node): Promise<boolean> {
    return client.content.update({ id, node });
  }

  return (
    <Suspense>
      <Page promise={promise} update={update} />
    </Suspense>
  );
}

function Page(
  props: { promise: Promise<Content>; update: (node: Node) => void },
): JSX.Element {
  const { promise, update } = props;
  const content = use(promise);

  const [node, setState] = useState(content.node);

  return (
    <div>
      <h1>Content</h1>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();

          update(node);
        }}
      >
        <Field node={node} onChange={setState}></Field>

        <button type="submit">Save</button>

        {JSON.stringify(node)}
      </form>
    </div>
  );
}
