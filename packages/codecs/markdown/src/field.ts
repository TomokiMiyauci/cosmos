import type {
  AssetNode,
  Codec,
  CodecContext,
  Field,
  MarkdownNode,
  Node,
  ReferenceNode,
  StringNode,
  Structure,
} from "@cosmos/core";
import { MarkdownParser } from "./parser.ts";
import { fromMarkdown } from "mdast-util-from-markdown";

export class MarkdownCodec implements Codec {
  #parser = new MarkdownParser();

  async parse(
    structure: Structure,
    _: Field,
    ctx: CodecContext,
  ): Promise<Node> {
    if (typeof structure !== "string") throw new Error();

    async function resolver(
      specifier: string,
    ): Promise<AssetNode | StringNode | ReferenceNode> {
      const assetNode = await ctx.config.field.asset.parse(specifier, _, ctx);

      if (ctx.asset.has(assetNode.value)) {
        return assetNode;
      }

      const referenceNode = await ctx.config.field.reference.parse(
        specifier,
        _,
        ctx,
      );

      if (ctx.node.has(referenceNode.value)) {
        return referenceNode;
      }

      const stringNode = await ctx.config.field.string.parse(specifier, _, ctx);

      return stringNode;
    }

    const root = fromMarkdown(structure);
    const node = await this.#parser.parse(root, { resolve: resolver });
    const value = {
      type: "markdown",
      value: node,
    } satisfies MarkdownNode;

    return value;
  }

  stringify(node: Node): Structure {
    throw new Error();
  }
}
