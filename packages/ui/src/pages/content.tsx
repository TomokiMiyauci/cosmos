import type { JSX } from "react";
import type { CmsService, Field } from "../type.ts";
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

  async function update(node: Node | null): Promise<boolean> {
    try {
      await service.saveEntry({ id: contentId, node });
      return true;
    } catch {
      return false;
    }
  }

  async function remove(): Promise<void> {
    await service.eraseNodeById(contentId);

    location.href = resolvePath(Page.Contents);
  }

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
