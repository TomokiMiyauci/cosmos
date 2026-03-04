export interface FieldMeta {
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

export type FieldType = Field["type"];

export interface Collection {
  name: string;
  typeName: string;
  meta: FieldMeta[];
  documents: Record<string, unknown>[];
}

export interface Manifest {
  version: string;
  collections: Collection[];
}

export interface Config {
  source: Storage;

  models: Model[];
}

export interface Model {
  name: string;
  fields: Field[];
  path: string;
  format: Format;
}

export type Format = "json";

export type Field = StringField | BooleanField;

interface BaseField {
  required?: boolean;
  description?: string;
  name: string;
}

export interface StringField extends BaseField {
  type: "string";
}

export interface BooleanField extends BaseField {
  type: "boolean";
}

export interface Adaptor {
  handle(request: Request, ctx: Context): Promise<Response> | Response;
}

export interface Context {
  manifest: Manifest;
}

export interface Storage {
  fetch(model: Model, ctx: { config: Config }): Promise<RawContent[]>;
}

export interface RawContent {
  id: string;
  content: string;
}

export interface Formatter {
  parse(content: string): Record<string, unknown>;

  serialize(content: Record<string, unknown>): string;
}
