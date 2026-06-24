import type { JSX } from "react";
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

      const path = resolvePath(Page.Content, { id: result.id });

      globalThis.location.href = path;
    }

    return false;
  }

  return (
    <div>
      <h1>Content</h1>

      <Form init={init} update={update} field={field} />
    </div>
  );
}
