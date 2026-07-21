import type { CmsService, Summary } from "../../../type.ts";
import type { Node } from "@cosmos/core";
import { Page, resolvePath } from "../../../router.ts";

export class NodeCreateUseCase {
  constructor(
    private service: CmsService,
    private model: string,
    private onRedirect: (to: string) => void,
  ) {}
  async execute(node: Node | null, summary: Summary): Promise<void> {
    if (node) {
      const [data, error] = await this.service.registerEntry(
        this.model,
        node,
        summary,
      );

      if (error) {
        console.log("error");
      } else {
        const path = resolvePath(Page.Content, { id: data.id });

        this.onRedirect(path);
      }
    }
  }
}
