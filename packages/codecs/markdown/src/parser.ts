import type {
  BlockContent,
  DefinitionContent,
  ListContent,
  PhrasingContent,
  Root,
  RootContent,
  RowContent,
  TableContent,
} from "mdast";
import type {
  AssetNode,
  BlockContentMapNode,
  BlockquoteMapNode,
  BreakMapNode,
  CodeMapNode,
  DefinitionContentMapNode,
  DefinitionMapNode,
  DeleteMapNode,
  EmphasisMapNode,
  FootnoteDefinitionMapNode,
  FootnoteReferenceMapNode,
  HeadingMapNode,
  HtmlMapNode,
  ImageMapNode,
  ImageReferenceMapNode,
  InlineCodeMapNode,
  LinkMapNode,
  LinkReferenceMapNode,
  ListContentMapNode,
  ListItemMapNode,
  ListMapNode,
  ParagraphMapNode,
  PharasingContentMapNode,
  PhrasingContentListNode,
  ReferenceNode,
  RootNodeListNode,
  RootNodeMapNode,
  RowContentMapNode,
  StringNode,
  StrongMapNode,
  TableCellMapNode,
  TableContentMapNode,
  TableMapNode,
  TableRowMapNode,
  TextMapNode,
  ThematicBreakMapNode,
  YamlMapNode,
} from "@cosmos/core";

interface Resolver {
  resolve(
    specifier: string,
  ):
    | StringNode
    | AssetNode
    | ReferenceNode
    | Promise<StringNode | AssetNode | ReferenceNode>;
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

  private transform(
    node: RootContent,
    ctx: Resolver,
  ): Promise<RootNodeMapNode> {
    return parseRootNode(node, ctx);
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

async function parseRootNode(
  node: RowContent,
  ctx: Resolver,
): Promise<RowContentMapNode>;
async function parseRootNode(
  node: TableContent,
  ctx: Resolver,
): Promise<TableContentMapNode>;
async function parseRootNode(
  node: ListContent,
  ctx: Resolver,
): Promise<ListContentMapNode>;
async function parseRootNode(
  node: BlockContent | DefinitionContent,
  ctx: Resolver,
): Promise<BlockContentMapNode | DefinitionContentMapNode>;
async function parseRootNode(
  node: PhrasingContent,
  ctx: Resolver,
): Promise<PharasingContentMapNode>;
async function parseRootNode(
  node: RootContent,
  ctx: Resolver,
): Promise<RootNodeMapNode>;
async function parseRootNode(
  node: RootContent,
  ctx: Resolver,
): Promise<RootNodeMapNode> {
  switch (node.type) {
    case "break":
    case "html":
    case "strong":
    case "inlineCode":
    case "link":
    case "linkReference":
    case "imageReference":
    case "delete":
    case "emphasis":
    case "image":
    case "footnoteReference": {
      return toPhrasing(node, ctx);
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
      } satisfies ParagraphMapNode;
    }

    case "blockquote": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "blockquote",
          },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies BlockquoteMapNode;
    }
    case "code": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "code",
          },
          lang: { type: "string", value: node.lang ?? "" },
          meta: { type: "string", value: node.meta ?? "" },
          value: { type: "string", value: node.value },
        },
      } satisfies CodeMapNode;
    }
    case "definition": {
      const url = await ctx.resolve(node.url);

      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "definition",
          },
          identifier: { type: "string", value: node.identifier },
          label: { type: "string", value: node.label ?? "" },
          title: { type: "string", value: node.title ?? "" },
          url,
        },
      } satisfies DefinitionMapNode;
    }
    case "footnoteDefinition": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "footnoteDefinition",
          },
          identifier: { type: "string", value: node.identifier },
          label: { type: "string", value: node.label ?? "" },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies FootnoteDefinitionMapNode;
    }

    case "list": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "list",
          },
          ordered: { type: "boolean", value: node.ordered ?? false },
          spread: { type: "boolean", value: node.spread ?? false },
          start: { type: "number", value: node.start ?? 0 },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies ListMapNode;
    }
    case "listItem": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "listItem",
          },
          spread: { type: "boolean", value: node.spread ?? false },
          checked: { type: "boolean", value: node.checked ?? false },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies ListItemMapNode;
    }
    case "table": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "table",
          },
          align: { type: "list", value: node.align ?? [] },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies TableMapNode;
    }
    case "tableCell": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "tableCell",
          },
          children: await toPhrasingList(node.children, ctx),
        },
      } satisfies TableCellMapNode;
    }
    case "tableRow": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "tableRow",
          },
          children: {
            type: "list",
            value: await Promise.all(
              node.children.map((v) => parseRootNode(v, ctx)),
            ),
          },
        },
      } satisfies TableRowMapNode;
    }
    case "thematicBreak": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "thematicBreak",
          },
        },
      } satisfies ThematicBreakMapNode;
    }
    case "yaml": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "yaml",
          },
          value: { type: "string", value: node.value },
        },
      } satisfies YamlMapNode;
    }
  }
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

    case "image": {
      const url = await ctx.resolve(content.url);

      return {
        type: "map",
        value: {
          type: { type: "string", value: "image" },
          url,
          alt: { type: "string", value: content.alt ?? "" },
          title: { type: "string", value: content.title ?? "" },
        },
      } satisfies ImageMapNode;
    }

    case "break": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "break" },
        },
      } satisfies BreakMapNode;
    }

    case "delete": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "delete" },
          children: await toPhrasingList(content.children, ctx),
        },
      } satisfies DeleteMapNode;
    }

    case "emphasis": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "emphasis" },
          children: await toPhrasingList(content.children, ctx),
        },
      } satisfies EmphasisMapNode;
    }

    case "footnoteReference": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "footnoteReference" },
          identifier: { type: "string", value: content.identifier },
          label: { type: "string", value: content.label ?? "" },
        },
      } satisfies FootnoteReferenceMapNode;
    }
    case "html": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "html" },
          value: { type: "string", value: content.value },
        },
      } satisfies HtmlMapNode;
    }
    case "imageReference": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "imageReference" },
          identifier: { type: "string", value: content.identifier },
          alt: { type: "string", value: content.alt ?? "" },
          label: { type: "string", value: content.label ?? "" },
          referenceType: { type: "string", value: content.referenceType },
        },
      } satisfies ImageReferenceMapNode;
    }
    case "inlineCode": {
      return {
        type: "map",
        value: {
          type: { type: "string", value: "inlineCode" },
          value: { type: "string", value: content.value },
        },
      } satisfies InlineCodeMapNode;
    }
    case "linkReference": {
      content;

      return {
        type: "map",
        value: {
          type: { type: "string", value: "linkReference" },
          identifier: { type: "string", value: content.identifier },
          label: { type: "string", value: content.label ?? "" },
          referenceType: { type: "string", value: content.referenceType },
          children: await toPhrasingList(content.children, ctx),
        },
      } satisfies LinkReferenceMapNode;
    }
    case "strong": {
      return {
        type: "map",
        value: {
          type: {
            type: "string",
            value: "strong",
          },
          children: await toPhrasingList(content.children, ctx),
        },
      } satisfies StrongMapNode;
    }
  }
}
