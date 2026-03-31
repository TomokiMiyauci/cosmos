export interface Manifest {
  version: string;
  definitions: Definition[];
}

export interface Definition {
  name: string;
  description: string;
  schemas: Schema[];
  members: string[];
}

export interface Config {
  formatters: FormatterDefinition[];
  fields: FieldDefinition;
  resources: Resource[];
  storage: Storage;
  indexes: IndexManager[];
  assets?: AssetDefinition[];
}

export interface AssetDefinition {
  indexer: IndexerDefinition;
}

export type FieldDefinition = {
  [k in FieldType]: FieldCodec;
};

export interface FieldCodec {
  parse(structure: StructureValue, ctx: FieldContext): Node;

  stringify(node: Node): StructureValue;
}

export interface FieldContext {
  url: URL;
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
  description?: string;
  fields: Field[];
  format: FormatDefinition;
}

export type Field =
  | StringField
  | BooleanField
  | ReferenceField
  | DatetimeField
  | AssetField;

export interface BaseField {
  name: string;
  description?: string;
  required?: boolean;
  type: string;
}

export type FieldType = Field["type"];

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

export interface DatetimeField extends BaseField {
  type: "datetime";
}

export interface AssetField extends BaseField {
  type: "asset";
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

export interface Protocol {
  handle(request: Request, ctx: ProtocolContext): Promise<Response> | Response;
}

export interface ProtocolContext {
  manifest: Manifest;
  datalayer: Datalayer;
  asset: AssetMapping;
}

export interface Datalayer {
  node: NodeLayer;
  asset: AssetLayer;
}

export interface NodeLayer {
  fetch(id: string): Node | Promise<Node>;
}

export interface AssetLayer {
  fetch(id: string): Blob | Promise<Blob>;
}

export interface AssetHeader {
  mimeType: string;
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
  read(url: URL): Blob | Promise<Blob>;
  write(url: URL, content: Blob): void | Promise<void>;
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

export interface DatetimeSchema extends BaseSchema {
  type: "datetime";
}

export interface MapSchema extends BaseSchema {
  type: "map";
  fields: Schema[];
}

export interface AssetSchema extends BaseSchema {
  type: "asset";
}

export type Schema =
  | IdSchema
  | StringSchema
  | BooleanSchema
  | MapSchema
  | DatetimeSchema
  | AssetSchema;

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

export interface DatetimeNode {
  type: DatetimeSchema["type"];
  value: Date;
}

export interface AssetNode {
  type: AssetSchema["type"];
  value: URL;
}

export type NodeValue =
  | IdNode
  | StringNode
  | BooleanNode
  | DatetimeNode
  | AssetNode;

export type Node = NodeValue | MapNode;

export interface MapNode {
  type: MapSchema["type"];
  value: Record<string, Node>;
}

export interface BaseEntry<T> {
  id: string;
  type: string;
  data: T;
}

export interface NodeEntry extends BaseEntry<Node> {
  type: "node";
  model: string;
}

export interface AssetEntry extends BaseEntry<Blob> {
  type: "asset";
}

export type Entry = NodeEntry | AssetEntry;

export interface AssetMapping {
  resolve(id: URL): URL | undefined;
  lookup(publicUrl: URL): URL | undefined;
}

export interface Store {
  save(entry: Entry): Promise<void>;

  load(id: string): Promise<Entry>;
}
