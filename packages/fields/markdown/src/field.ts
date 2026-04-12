import type {
  AssetNode,
  Field,
  FieldCodec,
  FieldContext,
  Node,
  ReferenceNode,
  StringNode,
  StructureValue,
} from "@cosmos/core";
import { MarkdownParser } from "./parser.ts";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toRoot, toString } from "./serializer.ts";

export class MarkdownCodec implements FieldCodec {
  #parser = new MarkdownParser();

  async parse(
    structure: StructureValue,
    _: Field,
    ctx: FieldContext,
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
    const rootNode = toRoot(node);
    const value = {
      type: "string",
      value: toString(rootNode),
    } satisfies StringNode;

    return value;
  }

  stringify(node: Node): StructureValue {
    throw new Error();
  }
}
