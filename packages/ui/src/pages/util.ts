import { mapValues } from "@std/collections/map-values";
import type { Store, StoreElement } from "../fields/type.ts";

export function node2Store(node: NodeWithId): Store {
  switch (node.type) {
    case "number":
    case "string": {
      return {
        [node.id]: toStoreElement(node),
      };
    }
    case "map": {
      const store = Object.values(node.value).map(node2Store).reduce(
        (acc, cur) => {
          return {
            ...acc,
            ...cur,
          };
        },
        {},
      );

      return {
        [node.id]: toStoreElement(node),
        ...store,
      };
    }
    case "list": {
      const store = node.value.map(node2Store).reduce(
        (acc, cur) => {
          return {
            ...acc,
            ...cur,
          };
        },
        {},
      );

      return {
        [node.id]: toStoreElement(node),
        ...store,
      };
    }
    case "boolean": {
      return { [node.id]: toStoreElement(node) };
    }
    case "datetime":
    case "reference":
    case "union":
    case "asset": {
      return {
        [node.id]: toStoreElement(node),
      };
    }
  }
}

function toStoreElement(node: NodeWithId): StoreElement {
  switch (node.type) {
    case "string": {
      return { type: "string", value: node.value };
    }
    case "number": {
      return {
        type: "number",
        value: node.value,
      };
    }
    case "map": {
      const value = mapValues(node.value, (node) => node.id);

      return {
        type: "link",
        value,
      };
    }
    case "list": {
      const value = node.value.map((node) => node.id);

      return {
        type: "list",
        value,
      };
    }
    case "boolean": {
      return {
        type: "boolean",
        value: node.value,
      };
    }
    case "reference":
    case "datetime":
    case "asset":
    case "union": {
      return {
        type: "string",
        value: "unklwon",
      };
    }
  }
}

export type NodeWithId =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode
  | ListNode
  | MapNode;

interface BaseNode {
  id: string;
}

export interface ReferenceNode extends BaseNode {
  type: "reference";
  value: string;
}

export interface StringNode extends BaseNode {
  type: "string";
  value: string;
}

export interface NumberNode extends BaseNode {
  type: "number";
  value: number;
}

export interface BooleanNode extends BaseNode {
  type: "boolean";
  value: boolean;
}

export interface DatetimeNode extends BaseNode {
  type: "datetime";
  value: Date;
}

export interface AssetNode extends BaseNode {
  type: "asset";
  value: string;
}

export interface ListNode extends BaseNode {
  type: "list";
  value: NodeWithId[];
}

export interface MapNode extends BaseNode {
  type: "map";
  value: Record<string, NodeWithId>;
}

export interface UnionNode extends BaseNode {
  type: "union";
  key: string;
  value: NodeWithId;
}
