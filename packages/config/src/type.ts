import type {
  AssetSchema,
  BooleanSchema,
  DatetimeSchema,
  EntityType,
  EntryRepositry,
  InstanceSchema,
  NumberSchema,
  ReferenceSchema,
  StringSchema,
} from "@cosmos/core";

export interface ModelConfig {
  title?: string;
  description?: string;
  schema: SchemaConfig;
}

export type SchemaConfig =
  | StringSchema
  | BooleanSchema
  | NumberSchema
  | DatetimeSchema
  | UnionSchemaConfig
  | ReferenceSchema
  | InstanceSchema
  | ListSchemaConfig
  | MapSchemaConfig
  | AssetSchema;

export interface MapSchemaConfig {
  type: "map";
  props: Record<string, ModelConfig>;
  required?: string[];
}

export interface UnionSchemaConfig {
  type: "union";
  variants: Record<string, ModelConfig>;
}

export interface ListSchemaConfig {
  type: "list";
  item: SchemaConfig;
}

export interface Config {
  resources: Record<string, ResourceConfig>;
  models: Record<string, ModelConfig>;
  repositry: EntryRepositry;
  reader: EntryReader;
}

export interface ResourceConfig {
  type: EntityType;
  model: string;
  description?: string;
  main?: string;
}
