import { Identifier, NumberValue, type SchemaValue } from "@cosmos/schema";
import { isIdentifier, isNumberValue } from "@cosmos/validator";
import { mapValues } from "@std/collections/map-values";

export type Node =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdNode
  | MapNode
  | SequenceNode;

export interface StringNode {
  type: "string";
  value: string;
}

export interface NumberNode {
  type: "number";
  value: number;
}

export interface BooleanNode {
  type: "boolean";
  value: boolean;
}

export interface IdNode {
  type: "id";
  value: string;
}

export interface MapNode {
  type: "map";
  value: Record<string, Node>;
}

export interface SequenceNode {
  type: "sequence";
  value: Node[];
}

export function toNode(value: SchemaValue): Node {
  if (typeof value === "string") {
    return { type: "string", value };
  }

  if (isNumberValue(value)) {
    return { type: "number", value: value.value };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", value };
  }

  if (isIdentifier(value)) {
    return { type: "id", value: value.value };
  }

  if (Array.isArray(value)) {
    return { type: "sequence", value: value.map(toNode) };
  }

  return {
    type: "map",
    value: mapValues(value, toNode),
  };
}

/**
 * @throws
 */
export function fromNode(node: Node): SchemaValue {
  switch (node.type) {
    case "string": {
      return node.value;
    }
    case "number": {
      const [data, error] = NumberValue.of(node.value);

      if (error) throw error;

      return data;
    }
    case "boolean": {
      return node.value;
    }
    case "id": {
      const [data, error] = Identifier.of(node.value);

      if (error) throw error;

      return data;
    }
    case "map": {
      return mapValues(node.value, fromNode);
    }
    case "sequence": {
      return node.value.map(fromNode);
    }
  }
}
