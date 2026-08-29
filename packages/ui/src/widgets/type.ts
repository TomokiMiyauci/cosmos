import type { ReactNode } from "react";
import type { Schema } from "../application/query.ts";

export interface WidgetProps {
  value: string | null;
  onChange(value: string | null): void;
  render(def: Definition, group?: string): ReactNode;
  definition: Definition;
  api: Api;
}

interface Api {
  useList(): List;
}

export interface List {
  [Symbol.iterator](): IterableIterator<Id>;
  append(): void;
  remove(id: Id): void;
}

type Id = string;

export interface Widget {
  (props: WidgetProps): ReactNode;
}

export type Definition =
  | StringDefinition
  | NumberDefinition
  | BooleanDefinition
  | ListDefinition
  | MapDefinition
  | UnionDefinition;

interface ListDefinition extends Schema.List, BaseDefinition {
  item: Definition;
}

interface BaseDefinition {
  presentation: Presentation;
}

interface StringDefinition extends Schema.String, BaseDefinition {}

interface NumberDefinition extends Schema.Number, BaseDefinition {}

interface BooleanDefinition extends Schema.Boolean, BaseDefinition {}

interface MapDefinition extends Schema.Map, BaseDefinition {
  props: Record<string, { field: Definition }>;
}

interface UnionDefinition extends Schema.Union, BaseDefinition {}

export interface Presentation {
  title: string;
  widget: Widget;
}
