export interface OnChange {
  (store: Store): void;
}

export type Node =
  | StringNode
  | NumberNode
  | MapNode
  | ListNode
  | BooleanNode
  | DatetimeNode
  | ReferenceNode;

export interface StringNode {
  type: "string";
  value: string;
}
export interface NumberNode {
  type: "number";
  value: number;
}

export interface BooleanNode {
  type: "boolean";
  value: boolean;
}

interface DatetimeNode {
  type: "datetime";
  value: Date;
}

interface MapNode {
  type: "map";
  value: Record<string, Node>;
}
interface ListNode {
  type: "list";
  value: Node[];
}

interface ReferenceNode {
  type: "reference";
  value: string;
}

export type Id = string;

interface BaseFieldDefinition {
  title: string;
}

export interface StringFieldDefinition extends BaseFieldDefinition {
  type: "string";
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  type: "number";
}

export interface BooleanFieldDefinition extends BaseFieldDefinition {
  type: "boolean";
}

export interface DatetimeFieldDefinition extends BaseFieldDefinition {
  type: "datetime";
}
export interface MapFieldDefinition {
  type: "map";
  properties: Record<string, FieldDefinition>;
}
export interface ListFieldDefinition {
  type: "list";
  item: FieldDefinition;
}

export interface UnionFieldDefinition {
  type: "union";
  variants: Record<string, FieldDefinition>;
}

export interface ReferenceFieldDefinition {
  type: "reference";
  options: FieldOption[];
}

export interface FieldOption {
  id: string;
  name: string;
}

export type FieldDefinition =
  | StringFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition
  | MapFieldDefinition
  | ListFieldDefinition
  | DatetimeFieldDefinition
  | UnionFieldDefinition
  | ReferenceFieldDefinition;

export interface EditString {
  type: "string";
  value: string;
}
export interface EditNumber {
  type: "number";
  value: number;
}
export interface EditBoolean {
  type: "boolean";
  value: boolean;
}

export interface EditDatetime {
  type: "datetime";
  value: Date;
}

export interface EditLink {
  type: "link";
  value: Record<string, Id>;
}

export interface EditUnion {
  type: "union";
  key: string;
  value: string;
}

export interface EditReference {
  type: "reference";
  value: string;
}

type EditPrimitive =
  | EditString
  | EditNumber
  | EditBoolean
  | EditDatetime;

interface EditList {
  type: "list";
  value: Id[];
}
export type StoreElement =
  | EditPrimitive
  | EditLink
  | EditList
  | EditUnion
  | EditReference;
export type Store = Record<Id, StoreElement>;

export type ErrorMap = Record<string, string>;
