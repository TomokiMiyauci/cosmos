export interface ModelConfig {
  schema: string;
  type: "collection" | "singleton";
}

export interface Config {
  models: Record<string, ModelConfig>;
  schemas: SchemaConfigMap;
}

export type SchemaConfigMap = Record<string, SchemaConfig>;

export type SchemaConfig =
  | StringSchemaDefinition
  | NumberSchemaDefinition
  | BooleanSchemaDefinition
  | TemporalSchemaDefinition
  | ListSchemaDefinition
  | MapSchemaDefiinition
  | UnionSchemaDefinition
  | ReferenceSchemaDefintion;

export interface StringSchemaDefinition {
  type: "string";
}

export interface NumberSchemaDefinition {
  type: "number";
}

export interface BooleanSchemaDefinition {
  type: "boolean";
}

export interface TemporalSchemaDefinition {
  type: "temporal";
}

export interface ListSchemaDefinition {
  type: "list";
  item: SchemaId;
}

type SchemaId = string;

export interface MapSchemaDefiinition {
  type: "map";
  props: Record<string, { required?: boolean; to: SchemaId }>;
}

export interface UnionSchemaDefinition {
  type: "union";
  schemas: SchemaId[];
}

export interface ReferenceSchemaDefintion {
  type: "reference";
  // to: SchemaId;
}
