import type { Schema } from "./schema.ts";
import type {
  BooleanSchema,
  MapSchema,
  NumberSchema,
  ReferenceSchema,
  SequenceSchema,
  StringSchema,
  UnionSchema,
} from "./schema.ts";
import { mapValues } from "@std/collections/map-values";

interface BaseSchemaNode {
  id: SchemaId;
}

export type SchemaId = string;

export interface StringSchemaNode extends StringSchema, BaseSchemaNode {}

export interface NumberSchemaNode extends NumberSchema, BaseSchemaNode {}

export interface BooleanSchemaNode extends BooleanSchema, BaseSchemaNode {}

export interface SequenceSchemaNode
  extends Omit<SequenceSchema, "item">, BaseSchemaNode {
  item: SchemaId;
}

export interface MapSchemaNode
  extends Omit<MapSchema, "properties">, BaseSchemaNode {
  properties: Record<string, SchemaId>;
}

export interface UnionSchemaNode
  extends Omit<UnionSchema, "members">, BaseSchemaNode {
  members: SchemaId[];
}
export interface ReferenceSchemaNode extends ReferenceSchema, BaseSchemaNode {}

export type SchemaNode =
  | StringSchemaNode
  | NumberSchemaNode
  | BooleanSchemaNode
  | SequenceSchemaNode
  | MapSchemaNode
  | UnionSchemaNode
  | ReferenceSchemaNode;

export function resolve(
  nodes: ReadonlySet<SchemaNode>,
): ReadonlyMap<SchemaId, Schema> {
  const resolved = new Map<SchemaId, Schema>();

  for (const node of nodes.values()) {
    resolved.set(node.id, createContainer(node));
  }

  for (const node of nodes.values()) {
    linkSchema(node);
  }

  return resolved;

  function linkSchema(node: SchemaNode): void {
    const schema = getSchema(node.id);

    switch (node.type) {
      case "string":
      case "number":
      case "boolean":
      case "reference":
        return;

      case "union": {
        if (schema.type !== "union") throw new Error("unreachable");

        schema.members = node.members.map(getSchema);

        break;
      }

      case "sequence": {
        if (schema.type !== "sequence") throw new Error("unreachable");

        schema.item = getSchema(node.item);

        break;
      }

      case "map": {
        if (schema.type !== "map") throw new Error("unreachable");

        schema.properties = mapValues(node.properties, getSchema);

        break;
      }
    }
  }

  function getSchema(id: SchemaId): Schema {
    const schema = resolved.get(id);

    if (!schema) throw new Error("unreachable");

    return schema;
  }
}

function createContainer(
  node: SchemaNode,
): Schema {
  switch (node.type) {
    case "string":
      return { type: "string", term: node.term };

    case "number":
      return { type: "number" };

    case "boolean":
      return { type: "boolean" };

    case "union":
      return { type: "union", members: [] };

    case "sequence":
      return { type: "sequence", item: PLACEHOLDER };

    case "map": {
      return { type: "map", properties: {}, required: node.required };
    }

    case "reference": {
      return { type: "reference" };
    }
  }
}

// deno-lint-ignore no-explicit-any
const PLACEHOLDER = undefined as any;
