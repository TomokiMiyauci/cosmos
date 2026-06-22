import { type JSX, Suspense, use } from "react";
import type { PageProps } from "./type.ts";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import { Page, resolvePath } from "../router.ts";
import type { Template } from "../type.ts";

export default function ContentCreationPage(
  props: PageProps,
): JSX.Element {
  const { service } = props;

  async function update(node: Node | null): Promise<boolean> {
    if (node) {
      const result = await service.saveNode(node);

      const path = resolvePath(Page.Content, { id: result.id });

      globalThis.location.href = path;
    }

    return false;
  }

  const promise = service.findTemplateByFieldId("post");

  return (
    <Suspense>
      <MainPage
        promise={promise}
        update={update}
      />
    </Suspense>
  );
}

function MainPage(
  props: {
    promise: Promise<Template | null>;
    update: (node: Node | null) => Promise<boolean>;
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
