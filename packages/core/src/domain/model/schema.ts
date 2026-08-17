export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | MapSchema
  | ListSchema
  | UnionSchema
  | ReferenceSchema
  | DatetimeSchema;

export interface StringSchema {
  type: "string";
}

export interface NumberSchema {
  type: "number";
}

export interface BooleanSchema {
  type: "boolean";
}

export interface DatetimeSchema {
  type: "datetime";
}

export interface MapSchema {
  type: "map";
  props: Record<string, PropertyDefinition>;
}

export interface ListSchema {
  type: "list";
  item: Schema;
}

export interface PropertyDefinition {
  required: boolean;
  schema: Schema;
}

export interface UnionSchema {
  type: "union";
  variants: Record<string, Schema>;
}

export interface ReferenceSchema {
  type: "reference";
}
