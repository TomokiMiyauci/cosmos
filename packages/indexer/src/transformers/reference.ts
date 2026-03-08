import { type ContentNode, StructuredURL } from "@cosmos/core";
import type { TransformContext, Transformer } from "../type.ts";

export class ReferenceTransfomer implements Transformer {
  transform(node: ContentNode, ctx: TransformContext): ContentNode | undefined {
    if (node.value.type !== "reference") return;

    const { value } = node;

    const base = new StructuredURL(value.value, ctx.config.model.base);

    const urls = ctx.contents.map(({ source }) => source);

    for (const url of urls) {
      if (url.toString() === base.toString()) {
        return {
          name: node.name,
          value: {
            type: "reference",
            value: url,
          },
        };
      }
    }

    return node;
  }
}
