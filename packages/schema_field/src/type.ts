import type { ReactNode } from "react";
import type {
  BooleanSchema,
  MapSchema,
  NumberSchema,
  ReferenceSchema,
  SequenceSchema,
  StringSchema,
  UnionSchema,
} from "@cosmos/schema";

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
  | UnionDefinition
  | ReferenceDefinition;

interface ListDefinition extends SequenceSchema, BaseDefinition {
  item: Definition;
}

interface BaseDefinition {
  presentation: Presentation;
}

interface StringDefinition extends StringSchema, BaseDefinition {}

interface NumberDefinition extends NumberSchema, BaseDefinition {}

interface BooleanDefinition extends BooleanSchema, BaseDefinition {}

interface MapDefinition extends MapSchema, BaseDefinition {
  properties: Record<string, Definition>;
}

interface UnionDefinition extends UnionSchema, BaseDefinition {
  members: Definition[];
}

interface ReferenceDefinition extends ReferenceSchema, BaseDefinition {
}

export interface Presentation {
  title: string;
  widget: Widget;
}
