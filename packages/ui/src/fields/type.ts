export interface OnChange {
  (fn: (store: Store) => Store): void;
}

export type Node = StringNode | NumberNode | MapNode | ListNode | BooleanNode;

interface StringNode {
  type: "string";
  value: string;
}
interface NumberNode {
  type: "number";
  value: number;
}

interface BooleanNode {
  type: "boolean";
  value: boolean;
}

interface MapNode {
  type: "map";
  value: Record<string, Node>;
}
interface ListNode {
  type: "list";
  value: Node[];
}

export type Id = string;

export interface StringFieldDefinition {
  type: "string";
  placeholder?: string;
}
export interface NumberFieldDefinition {
  type: "number";
  placeholder?: string;
}

export interface BooleanFieldDefinition {
  type: "boolean";
  placeholder?: string;
}
export interface MapFieldDefinition {
  type: "map";
  properties: Record<string, FieldDefinition>;
}
export interface ListFieldDefinition {
  type: "list";
  item: FieldDefinition;
}
export type FieldDefinition =
  | StringFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition
  | MapFieldDefinition
  | ListFieldDefinition;

interface EditString {
  type: "string";
  value: string;
}
interface EditNumber {
  type: "number";
  value: number;
}
interface EditBoolean {
  type: "boolean";
  value: boolean;
}

interface EditLink {
  type: "link";
  value: Record<string, Id>;
}
type EditPrimitive = EditString | EditNumber | EditBoolean;
interface EditList {
  type: "list";
  value: Id[];
}
export type StoreElement = EditPrimitive | EditLink | EditList;
export type Store = Record<Id, StoreElement | null>;
