import type { BaseNode } from "./type.ts";
import type { Node } from "@cosmos/core";

export function parseToNode(base: BaseNode): Node {
  switch (base.type) {
    case "string":
      if (typeof base.value !== "string") {
        throw new Error("Type mismatch: expected string");
      }
      return { type: "string", value: base.value };

    case "number":
      if (typeof base.value !== "number") {
        throw new Error("Type mismatch: expected number");
      }
      return { type: "number", value: base.value };

    case "boolean":
      if (typeof base.value !== "boolean") {
        throw new Error("Type mismatch: expected boolean");
      }
      return { type: "boolean", value: base.value };

    case "datetime":
      if (typeof base.value !== "string") {
        throw new Error("Type mismatch: expected date string");
      }
      return { type: "datetime", value: new Date(base.value) };

    case "map": {
      if (
        !base.value || typeof base.value !== "object" ||
        Array.isArray(base.value)
      ) {
        throw new Error("Type mismatch: expected object for map value");
      }

      const rawMap = base.value as JsonObject;
      const convertedMap: Record<string, Node> = {};

      for (const [key, childJson] of Object.entries(rawMap)) {
        if (!isJsonObject(childJson)) {
          throw new Error(
            `Map key "${key}" must be a JsonObject representing a Node.`,
          );
        }

        const childBase = toBaseNode(childJson);
        convertedMap[key] = parseToNode(childBase);
      }

      return { type: "map", value: convertedMap };
    }

    case "list": {
      if (!Array.isArray(base.value)) {
        throw new Error("Type mismatch: expected object for map value");
      }

      const value = base.value.map(parseToNode);

      return {
        type: "list",
        value,
      };
    }

    case "asset": {
      if (typeof base.value !== "string") {
        throw new Error();
      }

      return {
        type: "asset",
        value: base.value,
      };
    }

    case "markdown": {
      return {
        type: "markdown",
        value: {
          type: "list",
          value: [],
        },
      };
    }

    case "reference": {
      if (typeof base.value !== "string") {
        throw new Error("Type mismatch: expected string");
      }

      return {
        type: "reference",
        value: base.value,
      };
    }

    case "union": {
      if (!("key" in base && typeof base.key === "string")) throw new Error();

      const value = parseToNode(base.value);

      return {
        type: "union",
        key: base.key,
        value,
      };
    }

    default:
      throw new Error(`Unknown node type: ${base.type}`);
  }
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

function toBaseNode(obj: JsonObject): BaseNode {
  if (typeof obj.type !== "string" || !("value" in obj)) {
    throw new Error("Invalid Node format: 'type' or 'value' is missing.");
  }
  return {
    type: obj.type,
    value: obj.value,
    ...obj,
  };
}
