export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | DatetimeSchema
  | InstanceSchema
  | MapSchema
  | ReferenceSchema
  | ListSchema
  | AssetSchema
  | UnionSchema
  | MarkdownSchema;

export interface MapSchema {
  type: "map";
  props: Record<string, Model>;
  required: string[];
}

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

export interface InstanceSchema {
  type: "instance";
  model: string;
}

export interface ReferenceSchema {
  type: "reference";
  model: string;
}

export interface ListSchema {
  type: "list";
  item: Schema;
}

export interface AssetSchema {
  type: "asset";
}

export interface UnionSchema {
  type: "union";
  variants: Record<string, Model>;
}

export interface MarkdownSchema {
  type: "markdown";
}

export interface Model {
  title: string;
  description: string;
  schema: Schema;
}
