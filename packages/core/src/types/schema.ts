export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | DatetimeSchema
  | AssetSchema
  | MapSchema
  | ListSchema
  | ReferenceSchema
  | InstanceSchema
  | UnionSchema
  | MarkdownSchema;

export interface BaseSchema {
  type: string;
  description: string;
}

export interface StringSchema extends BaseSchema {
  type: "string";
}

export interface NumberSchema extends BaseSchema {
  type: "number";
}

export interface BooleanSchema extends BaseSchema {
  type: "boolean";
}

export interface DatetimeSchema extends BaseSchema {
  type: "datetime";
}

export interface AssetSchema extends BaseSchema {
  type: "asset";
}

export interface MapSchema extends BaseSchema {
  type: "map";
  props: Record<string, Schema>;
  required: string[];
}

export interface ListSchema extends BaseSchema {
  type: "list";
  item: Schema;
}

export interface ReferenceSchema extends BaseSchema {
  type: "reference";
  model: string;
}

export interface InstanceSchema extends BaseSchema {
  type: "instance";
  model: string;
}

export interface UnionSchema extends BaseSchema {
  type: "union";
  props: Record<string, Schema>;
}

export interface MarkdownSchema extends BaseSchema {
  type: "markdown";
}
