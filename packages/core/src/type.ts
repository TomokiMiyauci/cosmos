export interface Manifest {
  version: string;
  schemas: Record<string, Schema>;
  resources: string[];
}

export interface Config {
  formatters: FormatterDefinition[];
  field: FieldCodec;
  resources: Resource[];
  storage: Storage;
  indexes: IndexManager[];
  assets?: AssetDefinition[];
  resolver: Resolver;
  models: Record<string, Model>;
}

export interface AssetDefinition {
  indexer: IndexerDefinition;
}

export type FieldDefinition = {
  [k in FieldType]: FieldCodec;
};

export interface FieldCodec {
  parse(
    structure: StructureValue,
    field: Field,
    ctx: FieldContext,
  ): Node | Promise<Node>;

  stringify(node: Node, field: Field): StructureValue | Promise<StructureValue>;
}

export interface FieldContext extends ResolverContext {
  resolver: Resolver;
  asset: AssetRegistry;
  node: NodeRegistry;
}

export interface FormatterDefinition {
  type: string;
  formatter: Formatter;
}

export type Model = Field;

export type Field =
  | StringField
  | NumberField
  | BooleanField
  | InstanceField
  | ReferenceField
  | ListField
  | AssetField
  | MapField
  | DatetimeField
  | MarkdownField
  | UnionField;

export interface BaseField {
  description?: string;
  type: string;
}

export interface StringField extends BaseField {
  type: "string";
  format?: string;
}

export interface NumberField extends BaseField {
  type: "number";
}

export interface BooleanField extends BaseField {
  type: "boolean";
}

export interface DatetimeField extends BaseField {
  type: "datetime";
}

export interface MapField extends BaseField {
  type: "map";
  fields: Record<string, Field>;
  required?: string[];
}

export interface InstanceField extends BaseField {
  type: "instance";
  model: string;
}

export interface ReferenceField extends BaseField {
  type: "reference";
  model: string;
}

export interface ListField extends BaseField {
  type: "list";
  field: Field;
}

export interface AssetField extends BaseField {
  type: "asset";
}

export interface UnionField extends BaseField {
  type: "union";
  fields: Record<string, Field>;
}

export interface MarkdownField extends BaseField {
  type: "markdown";
}

export type FieldType = Field["type"];

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
  list(model: string): string[] | Promise<string[]>;
}

export interface AssetLayer {
  fetch(id: string): Blob | Promise<Blob>;
  list(): Promise<string[]>;
}

export interface AssetHeader {
  mimeType: string;
}

export interface Resource {
  format: FormatDefinition;
  model: string;
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
  type: string;
  description: string;
}

export interface StringSchema extends BaseSchema {
  type: "string";
}

export interface NumberSchema extends BaseSchema {
  type: "number";
}

export interface BooleanSchema extends BaseSchema {
  type: "boolean";
}

export interface DatetimeSchema extends BaseSchema {
  type: "datetime";
}

export interface AssetSchema extends BaseSchema {
  type: "asset";
}

export interface MapSchema extends BaseSchema {
  type: "map";
  props: Record<string, Schema>;
  required: string[];
}

export interface ListSchema extends BaseSchema {
  type: "list";
  item: Schema;
}

export interface ReferenceSchema extends BaseSchema {
  type: "reference";
  model: string;
}

export interface InstanceSchema extends BaseSchema {
  type: "instance";
  model: string;
}

export interface UnionSchema extends BaseSchema {
  type: "union";
  props: Record<string, Schema>;
}

export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | DatetimeSchema
  | AssetSchema
  | MapSchema
  | ListSchema
  | ReferenceSchema
  | InstanceSchema
  | UnionSchema;

export interface ReferenceNode {
  type: ReferenceSchema["type"];
  value: string;
}

export interface StringNode {
  type: StringSchema["type"];
  value: string;
}

export interface NumberNode {
  type: NumberSchema["type"];
  value: number;
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

export interface ListNode {
  type: ListSchema["type"];
  value: Node[];
}

export interface MapNode {
  type: MapSchema["type"];
  value: Record<string, Node>;
}

export interface UnionNode {
  type: UnionSchema["type"];
  key: string;
  value: Node;
}

export type NodeValue =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode;

export type Node = NodeValue | MapNode | ListNode;

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

  list(filter: EntryFilter): Promise<string[]>;
}

export type EntryFilter =
  | NodeEntryFilter
  | AssetEntryFilter;

export interface NodeEntryFilter {
  type: "node";
  model?: string;
}

export interface AssetEntryFilter {
  type: "asset";
}

export interface Resolver {
  resolve(specifier: string, ctx: ResolverContext): Promise<URL> | URL;
  unresolve(url: URL, ctx: ResolverContext): Promise<string> | string;
}

interface BaseContext {
  config: Config;
}

export interface ResolverContext extends BaseContext {
  baseUrl: URL;
}

export interface AssetRegistry {
  has(url: URL): boolean;
}

export interface NodeRegistry {
  has(url: URL): boolean;
}
