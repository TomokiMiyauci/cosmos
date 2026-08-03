import type { Node } from "@cosmos/core";
import type { Result } from "@miyauci/util";

export interface Content extends Data {
  id: string;
}

export interface Data {
  field: Field;
  meta: Meta;
  node: Node | null;
  name: string;
}

export interface Meta {
  title: string;
  description: string;
  model: string;
}

export interface CmsService {
  findTemplate(resourceId: string): Promise<Template | null>;
  findContent(contentId: Content["id"]): Promise<Content | null>;
  findSummaries(option?: ContentsOption): Promise<Summary[]>;
  findResource(id: string): Promise<Resource | null>;
  findResources(): Promise<Identity[]>;
  saveEntry(entry: Entry): Promise<Result<Node, {}>>;
  registerEntry(
    model: string,
    node: Node,
    summary: SummaryInput,
  ): Promise<Result<Identity, {}>>;
  eraseNodeById(id: string): Promise<void>;
  createEntry(entry: EntryInput): Promise<Result<void, EntryCreationFailure>>;
}

export interface EntryInput {
  name: string;
  node: NodeWithId;
  model: string;
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
}

export interface EntryCreationFailure {
  name?: ErrorDetail;
  node?: Errors;
}

export type ErrorCode = "Required";

export interface Errors {
  [k: string]: ErrorDetail;
}

export interface Resource {
  id: string;
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

export interface Summary extends SummaryInput {
  id: string;
  model: string;
}

export interface SummaryInput {
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

export interface Router {
  redirect(to: string): void;
}

export type NodeWithId =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode
  | ListNode
  | MapNode;

interface BaseNode {
  id: string;
}

export interface ReferenceNode extends BaseNode {
  type: "reference";
  value: string;
}

export interface StringNode extends BaseNode {
  type: "string";
  value: string;
}

export interface NumberNode extends BaseNode {
  type: "number";
  value: number;
}

export interface BooleanNode extends BaseNode {
  type: "boolean";
  value: boolean;
}

export interface DatetimeNode extends BaseNode {
  type: "datetime";
  value: Date;
}

export interface AssetNode extends BaseNode {
  type: "asset";
  value: string;
}

export interface ListNode extends BaseNode {
  type: "list";
  value: NodeWithId[];
}

export interface MapNode extends BaseNode {
  type: "map";
  value: Record<string, NodeWithId>;
}

export interface UnionNode extends BaseNode {
  type: "union";
  key: string;
  value: NodeWithId;
}
