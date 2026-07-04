import type { Node } from "@cosmos/core";
import type { Result } from "@miyauci/util";

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
  findSummaries(option?: ContentsOption): Promise<Summary[]>;
  findResources(): Promise<Identity[]>;
  saveEntry(entry: Entry): Promise<Result<Node, {}>>;
  registerEntry(
    resourceId: string,
    node: Node,
    summary: Summary,
  ): Promise<Result<Identity, {}>>;
  eraseNodeById(id: string): Promise<void>;
}
export interface ContentsOption {
  resource: string;
}

export interface Entry {
  id: string;
  node: Node;
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
  | UnionField
  | AssetField;

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
  candidates: Summary[];
}

export interface UnionField extends FieldMeta {
  type: "union";
  variants: Record<string, Field>;
}

export interface AssetField extends FieldMeta {
  type: "asset";
  candidates: Summary[];
}

export interface DraftEntry {
  node: Node | null;
  summary: Summary;
}

export interface Entry extends DraftEntry {
  node: Node;
}

export interface ResourceTemplate {
  /**
   * Model Name
   */
  title: string;

  /**
   * Model description
   */
  description: string;
  field: Field;
  node: Node | null;
}

export interface Document {
  title: string;
  description: string;
  field: Field;
  entry: DraftEntry;
}

export interface Summary {
  name: string;
}

export interface EntryCreationPayload extends Entry {
  resourceId: string;
}

export interface EntryPayload extends Entry {
  entryId: string;
}

export interface ResourceTemplatePayload extends ResourceTemplate {
  resourceId: string;
}

export interface SummaryPayload extends Summary {
  entryId: string;
}
