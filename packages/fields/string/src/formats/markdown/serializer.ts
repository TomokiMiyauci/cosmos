import type { Node, StringNode } from "@cosmos/core";
import type {
  HeadingMapNode,
  LinkMapNode,
  ParapraphMapNode,
  PhrasingContentListNode,
  RootNodeListNode,
  RootNodeMapNode,
  StrongMapNode,
  TextMapNode,
} from "./type.ts";
import type { PhrasingContent, Root, RootContent } from "mdast";
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

function toRootContent(node: RootNodeMapNode): RootContent {
  if (isTextNode(node)) {
    return {
      type: "text",
      value: node.value.value.value,
    };
  }

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

  throw new Error();
}

function toPhrasingContents(node: PhrasingContentListNode): PhrasingContent[] {
  return node.value.map(toPhrasingContent);
}

function toPhrasingContent(node: RootNodeMapNode): PhrasingContent {
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

function isParagraphNode(value: RootNodeMapNode): value is ParapraphMapNode {
  return value.value.type.value === "paragraph";
}

function isLinkNode(value: RootNodeMapNode): value is LinkMapNode {
  return value.value.type.value === "link";
}

function isStringNode(node: Node): node is StringNode {
  return node.type === "string";
}
