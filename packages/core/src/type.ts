export type Schema = FieldMetaString | FieldMetaBoolean | FieldMetaReference;

export interface FieldMetaBase {
  name: string;
  required: boolean;
  description: string;
}

export interface FieldMetaString extends FieldMetaBase {
  type: "string";
}

export interface FieldMetaBoolean extends FieldMetaBase {
  type: "boolean";
}

export interface FieldMetaReference extends FieldMetaBase {
  type: "reference";
  to: string;
}

export type FieldType = Field["type"];

export interface Manifest {
  version: string;
  definitions: Definition[];
}

export interface Definition {
  name: string;
  schemas: Schema[];
  members: string[];
}

export interface Entry {
  key: string;
  value: unknown;
}

export interface Config {
  source: Storage;
  locator: Locator;
  model: ModelDefinition;
}

export interface ModelDefinition {
  models: Model[];
  pattern: URLPatternInit;
}

export interface Model {
  name: string;
  fields: Field[];
  pattern: URLPatternInit;
  format: Format;
}

export type Format = "json";

export type Field = StringField | BooleanField | ReferenceField;

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

export interface ReferenceField extends BaseField {
  type: "reference";
  to: string;
}

export interface Delivery {
  handle(request: Request, ctx: DeliveryContext): Promise<Response> | Response;
}

export interface DeliveryContext {
  manifest: Manifest;
  fetcher: Fetcher;
}

export interface Fetcher {
  fetch(url: URL): Content | Promise<Content>;
}

export interface Locator {
  locate(location: URLPattern): Promise<URL[]> | URL[];
}

export interface Storage {
  read(url: URL): Uint8Array | Promise<Uint8Array>;
  write(url: URL, conetnt: Uint8Array): void | Promise<void>;
}

export interface Content {
  [k: string]: unknown;
}

export interface Formatter {
  parse(content: string): Record<string, unknown>;

  serialize(content: Record<string, unknown>): string;
}
