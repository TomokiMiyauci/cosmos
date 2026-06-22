import type { Node } from "@cosmos/core";

export interface Content {
  id: string;
  field: Field;
  node: Node | null;
}

export interface Usecase {
  findTemplateByModelId(modelId: string): Promise<Template>;
  findContentById(id: Content["id"]): Promise<Content>;
  queryContents(): Promise<Identity[]>;
  saveEntry(entry: Entry): Promise<void>;
  saveNode(node: Node): Promise<Identity>;
  eraseNodeById(id: string): Promise<void>;
}

export interface Entry {
  id: string;
  node: Node | null;
}

export interface Template {
  node: Node | null;
  field: Field;
}

export interface Identity {
  id: string;
}

export type Field =
  | StringField
  | MapField
  | DatetimeField
  | BooleanField
  | ListField
  | NumberField;

export interface StringField extends FieldMeta {
  type: "string";
}

export interface MapField {
  type: "map";
  fields: Record<string, Field>;
}

export interface DatetimeField extends FieldMeta {
  type: "datetime";
}

export interface FieldMeta {
  required: boolean;
  description: string;
}

export interface BooleanField extends FieldMeta {
  type: "boolean";
  required: boolean;
  description: string;
}

export interface ListField {
  type: "list";
  field: Field;
}
export interface NumberField extends FieldMeta {
  type: "number";
}
