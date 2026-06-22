import { type JSX, Suspense, use } from "react";
import type { PageProps } from "./type.ts";
import type { Field } from "../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../router.ts";
import Form from "../form.tsx";

export default function ContentPage(
  props: PageProps,
): JSX.Element {
  const { params, service } = props;

  if (typeof params.id !== "string") return <></>;

  const id = params.id;

  const promise = service.findContentById(id).then((content) => {
    if (!content) return null;

    return {
      node: content.node,
      field: content.field,
    };
  });

  async function update(node: Node | null): Promise<boolean> {
    try {
      await service.saveEntry({ id, node });
      return true;
    } catch {
      return false;
    }
  }

  async function remove(): Promise<void> {
    await service.eraseNodeById(id);

    location.href = resolvePath(Page.Contents);
  }

  return (
    <Suspense>
      <MainPage promise={promise} update={update} remove={remove} />
    </Suspense>
  );
}

function MainPage(
  props: {
    promise: Promise<Data | null>;
    update: (node: Node | null) => Promise<boolean>;
    remove(): Promise<void>;
  },
): JSX.Element {
  const { promise, update, remove } = props;
  const data = use(promise);

  if (!data) return <div>Not Found</div>;

  const { node: init, field } = data;

  return (
    <div>
      <h1>Content</h1>

      <Form init={init} update={update} field={field} />

      <button
        type="button"
        onClick={() => {
          remove();
        }}
      >
        Delete
      </button>
    </div>
  );
}

interface Data {
  field: Field;
  node: Node | null;
}
