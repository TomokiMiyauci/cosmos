"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import { Page, resolvePath } from "../router.ts";
import type { CmsService, Summary, Template } from "../type.ts";

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

  async function action(node: Node | null): Promise<void> {
    if (node) {
      const result = await service.registerEntry(resourceId, node, summary);

      if (result.ok) {
        const path = resolvePath(Page.Content, { id: result.data.id });

        globalThis.location.href = path;
      } else {
        console.log("error");
      }
    }
  }

  const [node, setState] = useState(init);
  const [summary, setSummary] = useState<Summary>({ name: "" });

  return (
    <div>
      <h1>Content</h1>

      <label>
        Name

        <input
          value={summary.name}
          onChange={(ev) => setSummary({ name: ev.target.value })}
        />
      </label>

      <Form node={node} update={action} field={field} onChange={setState} />
    </div>
  );
}
