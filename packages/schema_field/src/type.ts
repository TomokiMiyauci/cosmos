import type { ReactNode } from "react";

export interface WidgetProps {
  render(def: Definition, group?: string): ReactNode;
  definition: Definition;
  api: Api;
}

export type Primitive = string;

interface Api {
  useList(): List;
  useValue(): [
    value: string | null,
    setValue: (value: string | null) => void,
  ];
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

interface UnionDefinition extends Schema.Union, BaseDefinition {
  fields: Definition[];
}

export interface Presentation {
  title: string;
  widget: Widget;
}

export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ListSchema
  | MapSchema
  | UnionSchema;

export interface StringSchema {
  type: "string";
}

export interface NumberSchema {
  type: "number";
}

export interface BooleanSchema {
  type: "boolean";
}

export interface ListSchema {
  type: "list";
  item: Schema;
}

export interface MapSchema {
  type: "map";
  props: Record<string, { field: Schema }>;
}

export interface UnionSchema {
  type: "union";
  fields: Schema[];
}

// deno-lint-ignore no-namespace
export namespace Schema {
  export type String = StringSchema;
  export type Number = NumberSchema;
  export type Boolean = BooleanSchema;
  export type List = ListSchema;
  export type Map = MapSchema;
  export type Union = UnionSchema;
}
