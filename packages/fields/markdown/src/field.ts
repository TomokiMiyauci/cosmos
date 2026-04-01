import type {
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import RemarkLinkRewrite from "remark-link-rewrite";

export class MarkdownCodec implements FieldCodec {
  async parse(structure: StructureValue, ctx: FieldContext): Promise<Node> {
    if (typeof structure !== "string") throw new Error();

    const result = await unified()
      .use(remarkParse)
      .use(RemarkLinkRewrite, {
        replacer: (specifier: string) => {
          if (URL.canParse(specifier)) return specifier;

          return ctx.resolver.resolve(specifier, ctx);
        },
      })
      .use(remarkStringify)
      .process(structure);

    const value = result.value.toString();

    return {
      type: "markdown",
      value,
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "markdown") throw new Error();

    return node.value;
  }
}
