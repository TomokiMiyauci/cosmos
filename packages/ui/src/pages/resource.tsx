import { type JSX, Suspense, use } from "react";
import type { PageProps } from "./type.ts";
import type { Field, Node } from "@cosmos/core";
import Form from "../form.tsx";

export default function ContentPage(
  props: PageProps,
): JSX.Element {
  const { params, service } = props;

  if (typeof params.id !== "string") return <></>;

  const id = params.id;

  const promise = service.content.get(id).then((content) => {
    if (!content) return null;

    return {
      node: content.node,
      field: content.field,
    };
  });

  async function update(node: Node | null): Promise<Node | null> {
    const content = await service.content.update({ id, node });

    if (content) return content.node;

    return null;
  }

  return (
    <Suspense>
      <Page promise={promise} update={update} />
    </Suspense>
  );
}

function Page(
  props: {
    promise: Promise<Data | null>;
    update: (node: Node | null) => Promise<Node | null>;
  },
): JSX.Element {
  const { promise, update } = props;
  const data = use(promise);

  if (!data) return <div>Not Found</div>;

  const { node: init, field } = data;

  return (
    <div>
      <h1>Content</h1>

      <Form init={init} update={update} field={field} />
    </div>
  );
}

interface Data {
  field: Field;
  node: Node | null;
}
