import { SchemaId } from "./id.ts";
import type { SchemaRepository } from "./repository.ts";
import { SchemaInterpreter } from "./interpreter.ts";

export type Schema = PrimitiveSchema | CompositeSchema | ReferenceSchema;

export interface BaseSchema {
  id: SchemaId;
}

export type PrimitiveSchema =
  | LiteralSchema
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | TemporalSchema;

export type CompositeSchema = MapSchema | ListSchema | UnionSchema;

export interface LiteralSchema extends BaseSchema {
  type: "literal";
  value: string;
}

export interface StringSchema extends BaseSchema {
  readonly type: "string";
  readonly format: StringFormat | null;
}

export type StringFormat = "url" | "email";

export interface NumberSchema extends BaseSchema {
  type: "number";
}

export interface BooleanSchema extends BaseSchema {
  type: "boolean";
}

export interface MapSchema extends BaseSchema {
  type: "map";
  properties: Record<string, MapProperty>;
}

export interface MapProperty extends BaseSchema {
  required: boolean;
  schema: Schema;
}

export interface ListSchema extends BaseSchema {
  type: "list";
  schema: Schema;
}

export interface ReferenceSchema extends BaseSchema {
  type: "reference";
  schema: Schema;
}

export interface UnionSchema extends BaseSchema {
  type: "union";
  members: Schema[];
}

export interface TemporalSchema extends BaseSchema {
  type: "temporal";
}

// deno-lint-ignore no-namespace
export namespace Schema {
  export const Id = SchemaId;

  export type Repository = SchemaRepository;

  export const Interpreter = SchemaInterpreter;
}
