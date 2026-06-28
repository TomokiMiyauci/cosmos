import type {
  AssetNode,
  BooleanNode,
  DatetimeNode,
  ListNode,
  MapNode,
  MarkdownNode,
  Node,
  NumberNode,
  ReferenceNode,
  StringNode,
  UnionNode,
} from "./node.ts";
import type { Schema } from "./schema.ts";
import type {
  AssetSchema,
  BooleanSchema,
  DatetimeSchema,
  InstanceSchema,
  ListSchema,
  MapSchema,
  MarkdownSchema,
  Model,
  NumberSchema,
  ReferenceSchema,
  StringSchema,
  UnionSchema,
} from "./schema.ts";

export interface Manifest {
  version: string;
  schemas: Record<string, Schema>;
  resources: Record<string, Resource>;
}

export interface Config {
  formats: Record<string, Formatter>;
  codec: CodecMap;
  resources: Record<string, Resource>;
  sources: Source[];
  storages: Record<string, Storage>;
  locators: Record<string, Locator>;
  indexers: Indexer;
  models: Record<string, Model>;
  converters?: Partial<ConvertMap>;
  assets?: Record<string, Asset>;
}

export interface Asset {
  locator: LocatorDefinition;
}

export interface Source {
  resource: string;
  locator: LocatorDefinition;
  format: FormatDefinition;
}

export interface LocatorContext extends BaseContext {
  option: unknown;
}

export interface LocatorDefinition {
  type: string;
  option?: unknown;
}

export interface CodecMap {
  string: FieldCodec<StringSchema, StringNode>;
  asset: FieldCodec<AssetSchema, AssetNode>;
  map: FieldCodec<MapSchema, MapNode>;
  boolean: FieldCodec<BooleanSchema, BooleanNode>;
  number: FieldCodec<NumberSchema, NumberNode>;
  instance: FieldCodec<InstanceSchema>;
  list: FieldCodec<ListSchema, ListNode>;
  markdown: FieldCodec<MarkdownSchema, MarkdownNode>;
  reference: FieldCodec<ReferenceSchema, ReferenceNode>;
  datetime: FieldCodec<DatetimeSchema, DatetimeNode>;
  union: FieldCodec<UnionSchema, UnionNode>;
}

export interface ConvertMap {
  string: Converter;
  asset: Converter;
  map: Converter;
  boolean: Converter;
  number: Converter;
  instance: Converter;
  list: Converter;
  markdown: Converter;
  reference: Converter;
  datetime: Converter;
  union: Converter;
}

export interface Converter {
  standardize(strucrue: Structure, ctx: ConverterContext): Structure;
  specialize(strucrue: Structure, ctx: ConverterContext): Structure;
}

export interface ConverterContext extends ResolverContext {
}

export interface FieldCodec<T extends Schema = Schema, U extends Node = Node> {
  parse(
    structure: Structure,
    model: T,
    ctx: CodecContext,
  ): U | Promise<U>;

  stringify(
    node: U,
    model: T,
    ctx: CodecContext,
  ): Structure | Promise<Structure>;
}

export interface Codec {
  parse(
    structure: Structure,
    field: StringSchema,
    ctx: CodecContext,
  ): StringNode | Promise<StringNode>;
  parse(
    structure: Structure,
    field: NumberSchema,
    ctx: CodecContext,
  ): NumberNode | Promise<NumberNode>;
  parse(
    structure: Structure,
    field: BooleanSchema,
    ctx: CodecContext,
  ): BooleanNode | Promise<BooleanNode>;
  parse(
    structure: Structure,
    field: AssetSchema,
    ctx: CodecContext,
  ): AssetNode | Promise<AssetNode>;
  parse(
    structure: Structure,
    field: DatetimeSchema,
    ctx: CodecContext,
  ): DatetimeNode | Promise<DatetimeNode>;
  parse(
    structure: Structure,
    field: ReferenceSchema,
    ctx: CodecContext,
  ): ReferenceNode | Promise<ReferenceNode>;
  parse(
    structure: Structure,
    field: ListSchema,
    ctx: CodecContext,
  ): ListNode | Promise<ListNode>;
  parse(
    structure: Structure,
    field: MapSchema,
    ctx: CodecContext,
  ): MapNode | Promise<MapNode>;
  parse(
    structure: Structure,
    field: UnionSchema,
    ctx: CodecContext,
  ): UnionNode | Promise<UnionNode>;
  parse(
    structure: Structure,
    schema: Schema,
    ctx: CodecContext,
  ): Node | Promise<Node>;

  serialize(
    node: Node,
    schema: Schema,
    ctx: CodecContext,
  ): Structure | Promise<Structure>;
}

export interface CodecContext extends ResolverContext {
  asset: AssetRegistry;
  node: NodeRegistry;
  codec: Codec;
}

export interface FormatDefinition {
  type: string;
  option?: unknown;
}

export interface Protocol<T> {
  init(ctx: ProtocolContext): T;
  handle(request: Request, ctx: T): Promise<Response> | Response;
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
  list(): Promise<string[]> | string[];
}

export interface AssetHeader {
  mimeType: string;
}

export interface Resource {
  type: EntityType;
  model: string;
  description?: string;
  main?: string;
}

export type EntityType = "singleton" | "collection";

export interface Storage {
  read(url: URL): Blob | Promise<Blob>;
  write(url: URL, content: Blob): void | Promise<void>;
  delete(url: URL): void | Promise<void>;
}

export interface Locator {
  search(ctx: LocatorContext): AsyncIterable<URL>;
}

export type StructureValue = string;

export interface StructureObject {
  [k: string]: StructureObject | StructureValue;
}

export type Structure = StructureValue | StructureObject;

export interface FormatterContext {
  config: Config;
  option: unknown;
  resource: Resource;
}

export interface Formatter {
  parse(content: string, ctx: FormatterContext): Structure;

  serialize(structure: Structure, ctx: FormatterContext): string;
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

  load(id: string): Promise<Entry> | Entry;

  list(filter: EntryFilter): Promise<string[]> | string[];
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

export interface BaseContext {
  config: Config;
  base: URL;
}

export interface ResolverContext extends BaseContext {
  baseUrl: URL;
}

export interface AssetRegistry {
  has(id: string): boolean;
}

export interface NodeRegistry {
  has(id: string): boolean;
}

export interface Indexer {
  resolve(id: string): Promise<Index>;

  register(id: string, index: Index): Promise<void>;
  unregister(id: string): Promise<void>;

  search(query?: IndexQuery): Promise<IndexEntry[]>;
}

export type IndexEntry = [id: string, index: Index];

export type IndexQuery = ModelIndexQuery | AssetIndexQuery;

export interface ModelIndexQuery {
  type: "model";
  resource?: string;
}

export interface AssetIndexQuery {
  type: "asset";
}

export type Index = ModelIndex | AssetIndex;

interface IndexBase {
  name: string;
}

export interface ModelIndex extends IndexBase {
  type: "model";
  url: URL;
  resource: string;
}

export interface AssetIndex extends IndexBase {
  type: "asset";
}
