export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | MapSchema
  | SequenceSchema
  | ReferenceSchema
  | UnionSchema;

export interface StringSchema {
  type: "string";
  term: StringTerm | null;
}

export type StringTerm = "date" | "datetime";

export interface NumberSchema {
  type: "number";
}

export interface BooleanSchema {
  type: "boolean";
}

export interface MapSchema {
  type: "map";
  properties: Record<string, Schema>;
  required: string[];
}

export interface SequenceSchema {
  type: "sequence";
  item: Schema;
}

export interface ReferenceSchema {
  type: "reference";
}

export interface UnionSchema {
  type: "union";
  members: Schema[];
}
