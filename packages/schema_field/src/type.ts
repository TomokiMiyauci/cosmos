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

export interface ControlProps {
  render(def: Definition, group?: string): ReactNode;
  definition: Definition;
  required: boolean;
}

export type Primitive = string;

export type NativeFormPrimitiveValue = Primitive | null;

export type NativeFormValue = NativeFormPrimitiveValue | {
  [k: string]: NativeFormValue | undefined;
} | NativeFormValue[];

export type FieldValue = Record<string, NativeFormValue>;

export interface Control {
  (props: ControlProps): ReactNode;
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

export interface MapDefinition extends MapSchema, BaseDefinition {
  properties: Record<string, Definition>;
}

interface UnionDefinition extends UnionSchema, BaseDefinition {
  members: Definition[];
}

interface ReferenceDefinition extends ReferenceSchema, BaseDefinition {}

export interface Presentation {
  title: string;
  control: Control;
}
