"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import { Page, resolvePath } from "../router.ts";
import type { CmsService, Template } from "../type.ts";

export interface ContentCreatePageProps {
  template: Template;
  resourceId: string;
  service: CmsService;
}

export default function ContentCreationPage(
  props: ContentCreatePageProps,
): JSX.Element {
  const { template, resourceId, service } = props;
  const { node: init, field } = template;

  async function update(node: Node | null): Promise<boolean> {
    if (node) {
      const result = await service.saveNode(resourceId, node);

      if (result.ok) {
        const path = resolvePath(Page.Content, { id: result.data.id });

        globalThis.location.href = path;
      } else {
        console.log("error");
      }
    }

    return false;
  }

  const [node, setState] = useState(init);

  return (
    <div>
      <h1>Content</h1>

      <Form node={node} update={update} field={field} onChange={setState} />
    </div>
  );
}
