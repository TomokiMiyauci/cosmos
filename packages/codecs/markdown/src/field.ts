import type {
  AssetNode,
  CodecContext,
  Field,
  FieldCodec,
  MarkdownNode,
  ReferenceNode,
  StringNode,
  Structure,
} from "@cosmos/core";
import { MarkdownParser } from "./parser.ts";
import { fromMarkdown } from "mdast-util-from-markdown";

export class MarkdownCodec implements FieldCodec {
  #parser = new MarkdownParser();

  constructor(public models: string[]) {}

  async parse(
    structure: Structure,
    _: Field,
    ctx: CodecContext,
  ): Promise<MarkdownNode> {
    if (typeof structure !== "string") throw new Error();

    const models = this.models;

    async function resolver(
      specifier: string,
    ): Promise<AssetNode | StringNode | ReferenceNode> {
      const assetNode = await ctx.codec.parse(specifier, {
        type: "asset",
      }, ctx);

      if (ctx.asset.has(assetNode.value)) {
        return assetNode;
      }

      for (const model of models) {
        const referenceNode = await ctx.codec.parse(
          specifier,
          { type: "reference", model },
          ctx,
        );

        if (ctx.node.has(referenceNode.value)) {
          return referenceNode;
        }
      }

      const stringNode = await ctx.codec.parse(
        specifier,
        { type: "string" },
        ctx,
      );

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

  stringify(): Structure {
    throw new Error();
  }
}
