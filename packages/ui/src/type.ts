import type { Node } from "@cosmos/core";

export interface Content extends Data {
  id: string;
}

export interface Data {
  field: Field;
  meta: Meta;
  node: Node | null;
}

export interface Meta {
  title: string;
  description: string;
}

export interface CmsService {
  findTemplate(resourceId: string): Promise<Template | null>;
  findContent(contentId: Content["id"]): Promise<Content>;
  findContents(option?: ContentsOption): Promise<Identity[]>;
  findResources(): Promise<Identity[]>;
  saveEntry(entry: Entry): Promise<void>;
  saveNode(resource: string, node: Node): Promise<Identity>;
  eraseNodeById(id: string): Promise<void>;
}

export interface ContentsOption {
  resource: string;
}

export interface Entry {
  id: string;
  node: Node | null;
}

export interface Template {
  node: Node | null;
  field: Field;
  meta: Meta;
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
  | NumberField
  | ReferenceField
  | UnionField;

export interface StringField extends FieldMeta {
  type: "string";
}

export interface MapField extends FieldMeta {
  type: "map";
  fields: Record<string, Field>;
}

export interface DatetimeField extends FieldMeta {
  type: "datetime";
}

export interface FieldMeta {
  title: string;
  description: string;
  required: boolean;
}

export interface BooleanField extends FieldMeta {
  type: "boolean";
  required: boolean;
  description: string;
}

export interface ListField extends FieldMeta {
  type: "list";
  field: Field;
}
export interface NumberField extends FieldMeta {
  type: "number";
}

export interface ReferenceField extends FieldMeta {
  type: "reference";
  candidates: string[];
}

export interface UnionField extends FieldMeta {
  type: "union";
  variants: Record<string, Field>;
}
