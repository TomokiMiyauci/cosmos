import {
  Identifier,
  type MapValue,
  NumberValue,
  type SchemaValue,
  type SequenceValue,
} from "@cosmos/schema";
import { Result } from "@miyauci/util";

export interface EntryView {
  id: string;
  modelId: string;
  content: SchemaValue;
  createdAt: Temporal.Instant;
  updatedAt: Temporal.Instant;
}

export type SchemaNode =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdentifierNode
  | MapNode
  | SequenceNode;

export type StringNode = {
  type: "string";
  value: string;
};

export type NumberNode = {
  type: "number";
  value: number;
};

export type BooleanNode = {
  type: "boolean";
  value: boolean;
};

export type IdentifierNode = {
  type: "id";
  value: string;
};

export type MapNode = {
  type: "map";
  value: {
    [key: string]: SchemaNode;
  };
};

export type SequenceNode = {
  type: "sequence";
  value: Array<SchemaNode>;
};

export interface Locator {
  resolve(id: string): URL;
  locate(): URL;
}

export function parseText(value: string): EntryView {
  const json = JSON.parse(value);

  const [content, error] = node2SchemaValue(json.content);

  if (error) throw new Error("invalid content");

  const createdAt = Temporal.Instant.from(json.createdAt);
  const updatedAt = Temporal.Instant.from(json.updatedAt);

  return {
    id: json.id,
    modelId: json.modelId,
    content,
    createdAt,
    updatedAt,
  };
}

function node2SchemaValue(node: SchemaNode): Result<SchemaValue, Error> {
  switch (node.type) {
    case "string": {
      return Result.ok(node.value);
    }
    case "number": {
      return NumberValue.of(node.value);
    }
    case "boolean": {
      return Result.ok(node.value);
    }
    case "id": {
      return Identifier.of(node.value);
    }
    case "map": {
      const map: MapValue<SchemaValue> = {};

      for (const [key, value] of Object.entries(node.value)) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        map[key] = child;
      }

      return Result.ok(map);
    }
    case "sequence": {
      const set: SequenceValue<SchemaValue> = [];
      for (const value of node.value) {
        const [child, error] = node2SchemaValue(value);

        if (error) return Result.error(error);

        set.push(child);
      }

      return Result.ok(set);
    }
  }
}
