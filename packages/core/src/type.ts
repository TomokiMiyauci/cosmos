export interface Manifest {
  version: string;
  definitions: Definition[];
}

export interface Definition {
  name: string;
  schemas: Schema[];
  members: string[];
}

export interface Config {
  formatters: FormatterDefinition[];
  fields: FieldDefinition;
  resouces: Resource[];
  storages: StorageService[];
  indexes: IndexManager[];
}

export interface StorageService extends Storage {
  supports(url: URL): boolean;
}

export type FieldDefinition = {
  [k in FieldType]: FieldCodec;
};

export interface FieldCodec {
  parse(structure: StructureValue): Node;

  strinigify(node: Node): StructureValue;
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

export type Field = StringField | BooleanField | ReferenceField;

export interface BaseField {
  name: string;
  description?: string;
  required?: boolean;
  type: string;
}

type FieldType = Field["type"];

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

export interface MapField extends BaseField {
  type: "map";
  fields: Field[];
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

export interface Delivery {
  handle(request: Request, ctx: DeliveryContext): Promise<Response> | Response;
}

export interface DeliveryContext {
  manifest: Manifest;
  fetcher: Fetcher;
}

export interface Fetcher {
  fetch(id: string): Node | Promise<Node>;
}

export interface Locator {
  locate(location: URLPattern): Promise<URL[]> | URL[];
}

export interface Resource {
  model: Model;
  indexer: IndexerDefinition;
}

export interface IndexerDefinition {
  type: string;
  options: unknown;
}

export interface Storage {
  read(url: URL): Uint8Array | Promise<Uint8Array>;
  write(url: URL, content: Uint8Array): void | Promise<void>;
  delete(url: URL): void | Promise<void>;
}

export interface Indexer<T = unknown> {
  search(options: T): AsyncIterable<URL>;
}

export interface IndexManager extends Indexer {
  type: string;
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

export interface BaseSchema {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface IdSchema extends BaseSchema {
  type: "id";
  to: string;
}

export interface StringSchema extends BaseSchema {
  type: "string";
}

export interface BooleanSchema extends BaseSchema {
  type: "boolean";
}

export interface MapSchema extends BaseSchema {
  type: "map";
  fields: Schema[];
}

export type Schema = IdSchema | StringSchema | BooleanSchema | MapSchema;

export interface IdNode {
  type: IdSchema["type"];
  value: string;
}

export interface StringNode {
  type: StringSchema["type"];
  value: string;
}

export interface BooleanNode {
  type: BooleanSchema["type"];
  value: boolean;
}

export type Node = IdNode | StringNode | BooleanNode | MapNode;

export interface MapNode {
  type: MapSchema["type"];
  value: Record<string, Node>;
}

export interface NodeObject {
  id: string;
  node: Node;
}
