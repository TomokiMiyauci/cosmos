"use client";

import { type JSX } from "react";
import { Page, resolvePath } from "../router.ts";
import type { Result } from "@miyauci/util";

export interface ContentPageProps {
  contentId: string;
  // data: Data;
  // onAction: (entry: Entry) => Promise<Result<void, {}>>;
  onRemove: (id: string) => Promise<void>;
}

export default function ContentPage(
  props: ContentPageProps,
): JSX.Element {
  const { contentId, onRemove } = props;
  // const idNode = init ? withId(init, id) : null;
  // const initStore = idNode ? node2Store(idNode) : {};
  // const definition = toFieldDefinition(field);

  // async function update(node: Node): Promise<void> {
  //   const [data, error] = await onAction({
  //     id: contentId,
  //     node,
  //   });

  //   // if (error) {
  //   // } else {
  //   //   setState(data);
  //   //   alert("success");
  //   // }
  // }

  async function remove(): Promise<void> {
    await onRemove(contentId);

    location.href = resolvePath(Page.Contents);
  }

  return (
    <div>
      <h1>Content</h1>

      {
        /* <h2>{meta.title}</h2>
      <p>{meta.description}</p> */
      }

      <form
        action={async () => {
          "use server";

          // const result = await handleAction(node);
        }}
      >
        <button type="submit">Update</button>
      </form>

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
