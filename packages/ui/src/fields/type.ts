import type { Node } from "@cosmos/core";
import type { Field } from "../type.ts";
import type { JSX } from "react";

export interface OnChange {
  (fn: (store: Store) => Store): void;
}

export interface FieldProps {
  node: Node | null;
  onChange: OnChange;
  field: Field;
}

export interface RenderField {
  (props: FieldProps): JSX.Element;
}

export type N = StringNode | NumberNode | MapNode | ListNode;

interface StringNode {
  type: "string";
  value: string;
}
interface NumberNode {
  type: "number";
  value: number;
}
interface MapNode {
  type: "map";
  value: Record<string, N>;
}
interface ListNode {
  type: "list";
  value: N[];
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
interface EditLink {
  type: "link";
  value: Record<string, Id>;
}
type EditPrimitive = EditString | EditNumber;
interface EditList {
  type: "list";
  value: Id[];
}
export type StoreElement = EditPrimitive | EditLink | EditList;
export type Store = Record<Id, StoreElement | null>;
