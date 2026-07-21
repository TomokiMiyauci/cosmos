"use client";

import { type JSX, useState } from "react";
import type { Data, Entry } from "../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../router.ts";
import Form from "../form.tsx";
import type { Result } from "@miyauci/util";

export interface ContentPageProps {
  contentId: string;
  data: Data;
  onAction: (entry: Entry) => Promise<Result<Node, {}>>;
  onRemove: (id: string) => Promise<void>;
}

export default function ContentPage(
  props: ContentPageProps,
): JSX.Element {
  const { contentId, data, onAction, onRemove } = props;
  const { node: init, field, meta, name } = data;
  const [node, setState] = useState(init);

  async function update(node: Node): Promise<void> {
    const [data, error] = await onAction({
      id: contentId,
      node,
      summary: { name },
    });

    if (error) {
    } else {
      setState(data);
    }
  }

  async function handleAction(node: Node | null): Promise<void> {
    if (node) {
      await update(node);
    } else {
      await onRemove(contentId);
    }
  }

  async function remove(): Promise<void> {
    await onRemove(contentId);

    location.href = resolvePath(Page.Contents);
  }

  return (
    <div>
      <h1>Content</h1>

      <h2>{meta.title}</h2>
      <p>{meta.description}</p>
      <Form
        node={node}
        update={handleAction}
        field={field}
        onChange={setState}
      />

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
