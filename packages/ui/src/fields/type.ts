export interface OnChange {
  (fn: (store: Store) => Store): void;
}

export type Node =
  | StringNode
  | NumberNode
  | MapNode
  | ListNode
  | BooleanNode
  | DatetimeNode;

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

export interface DatetimeFieldDefinition {
  type: "datetime";
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

export interface UnionFieldDefinition {
  type: "union";
  variants: Record<string, FieldDefinition>;
}

export type FieldDefinition =
  | StringFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition
  | MapFieldDefinition
  | ListFieldDefinition
  | DatetimeFieldDefinition
  | UnionFieldDefinition;

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

interface EditDatetime {
  type: "datetime";
  value: Date;
}

interface EditLink {
  type: "link";
  value: Record<string, Id>;
}

interface EditUnion {
  type: "union";
  key: string;
  value: string;
  variants: Record<string, string>
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
export type StoreElement = EditPrimitive | EditLink | EditList | EditUnion;
export type Store = Record<Id, StoreElement | null>;
