import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
} from "@cosmos/core";

export function isStringNode(node: Node): node is StringNode {
  return node.type === "string";
}

export function isAssetNode(node: Node): node is AssetNode {
  return node.type === "asset";
}

export function isBooleanNode(node: Node): node is BooleanNode {
  return node.type === "boolean";
}

export function isDatetimeNode(node: Node): node is DatetimeNode {
  return node.type === "datetime";
}

export function isNumberNode(node: Node): node is NumberNode {
  return node.type === "number";
}

export function isListNode(node: Node): node is ListNode {
  return node.type === "list";
}

export function isMapNode(node: Node): node is MapNode {
  return node.type === "map";
}

export function isReferenceNode(node: Node): node is ReferenceNode {
  return node.type === "reference";
}
