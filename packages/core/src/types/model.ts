export type Field =
  | StringField
  | NumberField
  | BooleanField
  | InstanceField
  | ReferenceField
  | ListField
  | AssetField
  | MapField
  | DatetimeField
  | MarkdownField
  | UnionField;

export interface BaseField {
  description?: string;
  type: string;
}

export interface StringField extends BaseField {
  type: "string";
  format?: string;
}

export interface NumberField extends BaseField {
  type: "number";
}

export interface BooleanField extends BaseField {
  type: "boolean";
}

export interface DatetimeField extends BaseField {
  type: "datetime";
}

export interface MapField extends BaseField {
  type: "map";
  fields: Record<string, Field>;
  required?: string[];
}

export interface InstanceField extends BaseField {
  type: "instance";
  model: string;
}

export interface ReferenceField extends BaseField {
  type: "reference";
  model: string;
}

export interface ListField extends BaseField {
  type: "list";
  field: Field;
}

export interface AssetField extends BaseField {
  type: "asset";
}

export interface UnionField extends BaseField {
  type: "union";
  fields: Record<string, Field>;
}

export interface MarkdownField extends BaseField {
  type: "markdown";
}
