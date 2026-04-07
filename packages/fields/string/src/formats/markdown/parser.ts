import type { PhrasingContent, Root, RootContent } from "mdast";
import type { AssetNode, StringNode } from "@cosmos/core";
import type {
  HeadingMapNode,
  LinkMapNode,
  ParapraphMapNode,
  PharasingContentMapNode,
  PhrasingContentListNode,
  RootNodeListNode,
  RootNodeMapNode,
  StrongMapNode,
  TextMapNode,
} from "./type.ts";

interface Resolver {
  resolve(
    specifier: string,
  ): StringNode | AssetNode | Promise<StringNode | AssetNode>;
}

export class MarkdownParser {
  async parse(root: Root, ctx: Resolver): Promise<RootNodeListNode> {
    const promises = root.children.map((node) => this.transform(node, ctx));
    const value = await Promise.all(promises);

    return {
      type: "list",
      value,
    } satisfies RootNodeListNode;
  }

  private async transform(
    node: RootContent,
    ctx: Resolver,
  ): Promise<RootNodeMapNode> {
    switch (node.type) {
      case "strong": {
        return {
          type: "map",
          value: {
            type: {
              type: "string",
              value: "strong",
            },
            children: await toPhrasingList(node.children, ctx),
          },
        } satisfies StrongMapNode;
      }

      case "text": {
        return {
          type: "map",
          value: {
            type: {
              type: "string",
              value: "text",
            },
            value: {
              type: "string",
              value: node.value,
            },
          },
        } satisfies TextMapNode;
      }

      case "heading": {
        return {
          type: "map",
          value: {
            type: {
              type: "string",
              value: "heading",
            },
            depth: {
              type: "number",
              value: node.depth,
            },
            children: await toPhrasingList(node.children, ctx),
          },
        } satisfies HeadingMapNode;
      }

      case "paragraph": {
        return {
          type: "map",
          value: {
            type: {
              type: "string",
              value: "paragraph",
            },
            children: await toPhrasingList(node.children, ctx),
          },
        } satisfies ParapraphMapNode;
      }
    }

    throw new Error();
  }
}

async function toPhrasingList(
  lists: PhrasingContent[],
  ctx: Resolver,
): Promise<PhrasingContentListNode> {
  const promise = lists.map((node) => toPhrasing(node, ctx));
  const value = await Promise.all(promise);

  return {
    type: "list",
    value,
  };
}

async function toPhrasing(
  content: PhrasingContent,
  ctx: Resolver,
): Promise<PharasingContentMapNode> {
  switch (content.type) {
    case "text": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "text" },
          value: { type: "string", value: content.value },
        },
      };
    }
    case "link": {
      const url = await ctx.resolve(content.url);

      return {
        type: "map",
        value: {
          type: { type: "string", value: "link" },
          children: await toPhrasingList(content.children, ctx),
          url,
        },
      } satisfies LinkMapNode;
    }
  }

  throw new Error();
}
