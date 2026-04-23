import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  MarkdonwNode,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  UnionNode,
} from "@cosmos/core";

export function assertStringNode(node: Node): asserts node is StringNode {
  if (node.type !== "string") throw new Error();
}

export function assertNumberNode(node: Node): asserts node is NumberNode {
  if (node.type !== "number") throw new Error();
}

export function assertMapNode(node: Node): asserts node is MapNode {
  if (node.type !== "map") throw new Error();
}

export function assertListNode(node: Node): asserts node is ListNode {
  if (node.type !== "list") throw new Error();
}

export function assertMarkdownNode(node: Node): asserts node is MarkdonwNode {
  if (node.type !== "markdown") throw new Error();
}

export function assertBooleanNode(node: Node): asserts node is BooleanNode {
  if (node.type !== "boolean") throw new Error();
}

export function assertDatetimeNode(node: Node): asserts node is DatetimeNode {
  if (node.type !== "datetime") throw new Error();
}

export function assertAssertNode(node: Node): asserts node is AssetNode {
  if (node.type !== "asset") throw new Error();
}

export function assertReferenceNode(node: Node): asserts node is ReferenceNode {
  if (node.type !== "reference") throw new Error();
}

export function assertUnionNode(node: Node): asserts node is UnionNode {
  if (node.type !== "union") throw new Error();
}
