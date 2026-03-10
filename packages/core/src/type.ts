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
  formatters: FormatterDefinition[];
}

export interface FormatterDefinition {
  type: string;
  formatter: Formatter;
}

export interface ModelDefinition {
  models: Model[];
  base: URLPatternInit;
}

export interface Model {
  name: string;
  fields: Field[];
  pattern: URLPatternInit;
  format: FormatDefinition;
}

export type FormatDefinition = {
  [K in keyof FormatterRegistry]:
    & FormatterDefinitionBase<K>
    & FormatterRegistry[K];
}[keyof FormatterRegistry];

export interface FormatterDefinitionBase<T> {
  type: T;
}

// deno-lint-ignore no-empty-interface
export interface FormatterRegistry {}

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
  fetch(url: URL): Structure | Promise<Structure>;
}

export interface Locator {
  locate(location: URLPattern): Promise<URL[]> | URL[];
}

export interface Storage {
  read(url: URL): Uint8Array | Promise<Uint8Array>;
  write(url: URL, conetnt: Uint8Array): void | Promise<void>;
}

export type StructureValue = string | Structure;

export interface Structure {
  [k: string]: StructureValue;
}

export interface FormatterContext<T = unknown> {
  config: Config;
  options: T;
}

export interface Formatter<T = unknown> {
  parse(content: string, ctx: FormatterContext<T>): Structure;

  serialize(content: Structure, ctx: FormatterContext<T>): string;
}

export interface ReferenceValue {
  type: "reference";
  value: URLPatternInit;
}

export interface StringValue {
  type: "string";
  value: string;
}

export interface BooleanValue {
  type: "boolean";
  value: boolean;
}

export type ContentValue = StringValue | BooleanValue | ReferenceValue;

export interface ContentNode {
  name: string;
  value: ContentValue;
}
