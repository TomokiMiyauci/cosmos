import type {
  Asset,
  AssetSchema,
  BooleanSchema,
  ConvertMap,
  DatetimeSchema,
  EntityType,
  EntryRepositry,
  Formatter,
  Indexer,
  InstanceSchema,
  NumberSchema,
  ReferenceSchema,
  Source,
  Storage,
  StringSchema,
} from "@cosmos/core";
import type { CodecMap } from "./codec.ts";

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
  formats: Record<string, Formatter>;
  codec: CodecMap;
  resources: Record<string, ResourceConfig>;
  sources: Source[];
  storages: Record<string, Storage>;
  indexer: Indexer;
  models: Record<string, ModelConfig>;
  converters?: Partial<ConvertMap>;
  assets?: Record<string, Asset>;
  repositry: EntryRepositry;
}

export interface ResourceConfig {
  type: EntityType;
  model: string;
  description?: string;
  main?: string;
}
