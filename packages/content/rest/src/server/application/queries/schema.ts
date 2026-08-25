export interface SchemaQuery {
  findById(id: string): Promise<SchemaView | null>;
  findAll(): Promise<SchemaView[]>;
}

export type SchemaView =
  | StringSchemaView
  | NumberSchemaView
  | BooleanSchemaView
  | TemporalSchemaView
  | ListSchemaView
  | MapSchemaView
  | RefernceSchemaView
  | UnionSchemaView;

export interface BaseSchemaView {
  id: string;
}

export interface StringSchemaView extends BaseSchemaView {
  type: "string";
}

export interface NumberSchemaView extends BaseSchemaView {
  type: "number";
}

export interface BooleanSchemaView extends BaseSchemaView {
  type: "boolean";
}

export interface TemporalSchemaView extends BaseSchemaView {
  type: "temporal";
}

export interface MapSchemaView extends BaseSchemaView {
  type: "map";
  properties: Record<string, MapShcemaProperty>;
}

export interface ListSchemaView extends BaseSchemaView {
  type: "list";
  item: SchemaView;
}

export interface MapShcemaProperty {
  required: boolean;
  schema: SchemaView;
}

export interface RefernceSchemaView extends BaseSchemaView {
  type: "reference";
  schema: SchemaView;
}

export interface UnionSchemaView extends BaseSchemaView {
  type: "union";
  schemas: SchemaView[];
}
