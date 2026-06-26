"use client";

import { type JSX, useState } from "react";
import type { CmsService, Data } from "../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../router.ts";
import Form from "../form.tsx";

export interface ContentPageProps {
  contentId: string;
  data: Data;
  service: CmsService;
}

export default function ContentPage(
  props: ContentPageProps,
): JSX.Element {
  const { contentId, data, service } = props;
  const { node: init, field, meta } = data;
  const [node, setState] = useState(init);

  async function update(node: Node): Promise<void> {
    const result = await service.saveEntry({ id: contentId, node });

    if (result.ok) {
      setState(result.data);
    } else {
    }
  }

  async function action(node: Node | null): Promise<void> {
    if (node) {
      await update(node);
    } else {
      await service.eraseNodeById(contentId);
    }
  }

  async function remove(): Promise<void> {
    await service.eraseNodeById(contentId);

    location.href = resolvePath(Page.Contents);
  }

  return (
    <div>
      <h1>Content</h1>

      <h2>{meta.title}</h2>
      <p>{meta.description}</p>
      <Form node={node} update={action} field={field} onChange={setState} />

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
