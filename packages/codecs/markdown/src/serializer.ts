import type {
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
  Node,
  ParagraphMapNode,
  PharasingContentMapNode,
  PhrasingContentListNode,
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
import { toMarkdown } from "mdast-util-to-markdown";

export function toString(root: Root): string {
  return toMarkdown(root);
}

export function toRoot(node: RootNodeListNode): Root {
  const children = toRootContents(node);

  return { type: "root", children };
}

function toRootContents(node: RootNodeListNode): RootContent[] {
  return node.value.map(toRootContent);
}

function toRootContent(node: RowContentMapNode): RowContent;
function toRootContent(node: TableContentMapNode): TableContent;
function toRootContent(node: ListContentMapNode): ListContent;
function toRootContent(
  node: BlockContentMapNode | DefinitionContentMapNode,
): BlockContent | DefinitionContent;
function toRootContent(node: PharasingContentMapNode): PhrasingContent;
function toRootContent(node: RootNodeMapNode): RootContent;
function toRootContent(node: RootNodeMapNode): RootContent {
  if (isHeadingNode(node)) {
    const children = toPhrasingContents(node.value.children);

    return {
      type: "heading",
      depth: node.value.depth.value as any,
      children,
    };
  }

  if (isStrongNode(node)) {
    const children = toPhrasingContents(node.value.children);

    return {
      type: "strong",
      children,
    };
  }

  if (isParagraphNode(node)) {
    const children = toPhrasingContents(node.value.children);

    return {
      type: "paragraph",
      children,
    };
  }

  if (isLinkNode(node)) {
    const url = isStringNode(node.value.url)
      ? node.value.url.value
      : node.value.url.value.toString();

    return {
      type: "link",
      url,
      children: toPhrasingContents(node.value.children),
    };
  }

  if (isBlockquoteNode(node)) {
    return {
      type: "blockquote",
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isCodeNode(node)) {
    const { value, lang, meta } = node.value;
    return {
      type: "code",
      value: value.value,
      lang: lang.value,
      meta: meta.value,
    };
  }

  if (isDefinitionNode(node)) {
    const { identifier, label, title, url } = node.value;
    return {
      type: "definition",
      identifier: identifier.value,
      label: label.value,
      title: title.value,
      url: url.value.toString(),
    };
  }

  if (isFootnoteDefinitionNode(node)) {
    const { identifier, label } = node.value;
    return {
      type: "footnoteDefinition",
      identifier: identifier.value,
      label: label.value,
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isListNode(node)) {
    const { ordered, spread, start } = node.value;

    return {
      type: "list",
      ordered: ordered.value,
      spread: spread.value,
      start: start.value,
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isListItemNode(node)) {
    const { checked, spread } = node.value;

    return {
      type: "listItem",
      checked: checked.value,
      spread: spread.value,
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isTableNode(node)) {
    const { align } = node.value;

    return {
      type: "table",
      align: align.value.map((node) => node.value),
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isTableCellNode(node)) {
    return {
      type: "tableCell",
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isTableRowNode(node)) {
    return {
      type: "tableRow",
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isThematicBreakNode(node)) {
    return {
      type: "thematicBreak",
    };
  }

  if (isYamlNode(node)) {
    const { value } = node.value;

    return {
      type: "yaml",
      value: value.value,
    };
  }

  return toPhrasingContent(node);
}

function toPhrasingContents(node: PhrasingContentListNode): PhrasingContent[] {
  return node.value.map(toPhrasingContent);
}

function toPhrasingContent(node: PharasingContentMapNode): PhrasingContent {
  if (isTextNode(node)) {
    return {
      type: "text",
      value: node.value.value.value,
    };
  }

  if (isStrongNode(node)) {
    const children = toPhrasingContents(node.value.children);

    return {
      type: "strong",
      children,
    };
  }

  if (isLinkNode(node)) {
    const url = isStringNode(node.value.url)
      ? node.value.url.value
      : node.value.url.value.toString();

    return {
      type: "link",
      url,
      children: toPhrasingContents(node.value.children),
    };
  }

  if (isImageNode(node)) {
    const { alt, title, url } = node.value;

    return {
      type: "image",
      alt: alt.value,
      title: title.value,
      url: url.value.toString(),
    };
  }

  if (isBreakNode(node)) {
    return {
      type: "break",
    };
  }

  if (isDeleteNode(node)) {
    return {
      type: "delete",
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isEmphasisNode(node)) {
    return {
      type: "emphasis",
      children: node.value.children.value.map((node) => toRootContent(node)),
    };
  }

  if (isFootnoteReferenceNode(node)) {
    const { identifier, label } = node.value;

    return {
      type: "footnoteReference",
      identifier: identifier.value,
      label: label.value,
    };
  }

  if (isHtmlNode(node)) {
    const { value } = node.value;

    return {
      type: "html",
      value: value.value,
    };
  }

  if (isImageReferenceNode(node)) {
    const { alt, identifier, label, referenceType } = node.value;

    return {
      type: "imageReference",
      alt: alt.value,
      identifier: identifier.value,
      label: label.value,
      referenceType: referenceType.value,
    };
  }

  if (isInlineCodeNode(node)) {
    const { value } = node.value;

    return {
      type: "inlineCode",
      value: value.value,
    };
  }

  if (isLinkReferenceNode(node)) {
    const { identifier, label, referenceType } = node.value;

    return {
      type: "linkReference",
      children: node.value.children.value.map((node) => toRootContent(node)),
      identifier: identifier.value,
      label: label.value,
      referenceType: referenceType.value,
    };
  }

  throw new Error("unreachable");
}

function isTextNode(node: RootNodeMapNode): node is TextMapNode {
  return node.value.type.value === "text";
}

function isHeadingNode(value: RootNodeMapNode): value is HeadingMapNode {
  return value.value.type.value === "heading";
}

function isStrongNode(value: RootNodeMapNode): value is StrongMapNode {
  return value.value.type.value === "strong";
}

function isParagraphNode(value: RootNodeMapNode): value is ParagraphMapNode {
  return value.value.type.value === "paragraph";
}

function isLinkNode(value: RootNodeMapNode): value is LinkMapNode {
  return value.value.type.value === "link";
}

function isStringNode(node: Node): node is StringNode {
  return node.type === "string";
}

function isBlockquoteNode(node: RootNodeMapNode): node is BlockquoteMapNode {
  return node.value.type.value === "blockquote";
}

function isCodeNode(node: RootNodeMapNode): node is CodeMapNode {
  return node.value.type.value === "code";
}

function isDefinitionNode(node: RootNodeMapNode): node is DefinitionMapNode {
  return node.value.type.value === "definition";
}

function isFootnoteDefinitionNode(
  node: RootNodeMapNode,
): node is FootnoteDefinitionMapNode {
  return node.value.type.value === "footnoteDefinition";
}

function isFootnoteReferenceNode(
  node: RootNodeMapNode,
): node is FootnoteReferenceMapNode {
  return node.value.type.value === "footnoteReference";
}

function isListNode(
  node: RootNodeMapNode,
): node is ListMapNode {
  return node.value.type.value === "list";
}

function isListItemNode(
  node: RootNodeMapNode,
): node is ListItemMapNode {
  return node.value.type.value === "listItem";
}

function isTableNode(
  node: RootNodeMapNode,
): node is TableMapNode {
  return node.value.type.value === "table";
}

function isTableCellNode(
  node: RootNodeMapNode,
): node is TableCellMapNode {
  return node.value.type.value === "tableCell";
}

function isTableRowNode(
  node: RootNodeMapNode,
): node is TableRowMapNode {
  return node.value.type.value === "tableRow";
}

function isThematicBreakNode(
  node: RootNodeMapNode,
): node is ThematicBreakMapNode {
  return node.value.type.value === "thematicBreak";
}

function isYamlNode(
  node: RootNodeMapNode,
): node is YamlMapNode {
  return node.value.type.value === "yaml";
}

function isImageNode(
  node: RootNodeMapNode,
): node is ImageMapNode {
  return node.value.type.value === "image";
}

function isBreakNode(
  node: RootNodeMapNode,
): node is BreakMapNode {
  return node.value.type.value === "break";
}

function isDeleteNode(
  node: RootNodeMapNode,
): node is DeleteMapNode {
  return node.value.type.value === "delete";
}

function isEmphasisNode(
  node: RootNodeMapNode,
): node is EmphasisMapNode {
  return node.value.type.value === "emphasis";
}

function isHtmlNode(
  node: RootNodeMapNode,
): node is HtmlMapNode {
  return node.value.type.value === "html";
}

function isImageReferenceNode(
  node: RootNodeMapNode,
): node is ImageReferenceMapNode {
  return node.value.type.value === "imageReference";
}

function isInlineCodeNode(
  node: RootNodeMapNode,
): node is InlineCodeMapNode {
  return node.value.type.value === "inlineCode";
}

function isLinkReferenceNode(
  node: RootNodeMapNode,
): node is LinkReferenceMapNode {
  return node.value.type.value === "linkReference";
}
