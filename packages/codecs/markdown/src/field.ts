import type {
  AssetNode,
  Codec,
  CodecContext,
  Field,
  MarkdownNode,
  Node,
  ReferenceNode,
  StringNode,
  StructureValue,
} from "@cosmos/core";
import { MarkdownParser } from "./parser.ts";
import { fromMarkdown } from "mdast-util-from-markdown";

export class MarkdownCodec implements Codec {
  #parser = new MarkdownParser();

  async parse(
    structure: StructureValue,
    _: Field,
    ctx: CodecContext,
  ): Promise<Node> {
    if (typeof structure !== "string") throw new Error();

    async function resolver(
      specifier: string,
    ): Promise<AssetNode | StringNode | ReferenceNode> {
      const url = await ctx.resolver.resolve(specifier, ctx);

      if (ctx.asset.has(url)) {
        return {
          type: "asset",
          value: url,
        };
      }

      if (ctx.node.has(url)) {
        return {
          type: "reference",
          value: url.toString(),
        };
      }

      return {
        type: "string",
        value: url.toString(),
      };
    }

    const root = fromMarkdown(structure);
    const node = await this.#parser.parse(root, { resolve: resolver });
    const value = {
      type: "markdown",
      value: node,
    } satisfies MarkdownNode;

    return value;
  }

  stringify(node: Node): StructureValue {
    throw new Error();
  }
}
