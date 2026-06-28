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
  UnionNode,
} from "@cosmos/core";

export function createStringNode(value: string): StringNode {
  return { type: "string", value };
}

export function createNumberNode(value: number): NumberNode {
  return { type: "number", value };
}

export function createBooleanNode(value: boolean): BooleanNode {
  return { type: "boolean", value };
}

export function createAssetNode(value: string): AssetNode {
  return { type: "asset", value };
}

export function createListNode(value: Iterable<Readonly<Node>>): ListNode {
  return { type: "list", value: [...value] };
}

export function createDatetimeNode(value: Date): DatetimeNode {
  return { type: "datetime", value };
}

export function createMapNode(
  value: Readonly<Record<string, Readonly<Node>>>,
): MapNode {
  return { type: "map", value };
}

export function createReferenceNode(value: string): ReferenceNode {
  return { type: "reference", value };
}

export function createUnionNode(value: Readonly<Node>, key: string): UnionNode {
  return { type: "union", value, key };
}
