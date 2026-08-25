export interface ModelConfig {
  schema: string;
  type: "collection" | "singleton";
}

export interface Config {
  models: Record<string, ModelConfig>;
  schemas: Record<string, SchemaConfig>;
}

export type SchemaConfig = StringSchemaDefinition | MapSchemaDefiinition;

interface StringSchemaDefinition {
  type: "string";
}

interface MapSchemaDefiinition {
  type: "map";
  props: Record<string, { required?: boolean; to: string }>;
}
