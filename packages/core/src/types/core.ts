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
  AssetField,
  BooleanField,
  DatetimeField,
  Field,
  InstanceField,
  ListField,
  MapField,
  MarkdownField,
  NumberField,
  ReferenceField,
  StringField,
  UnionField,
} from "./field.ts";

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

export interface LocatorContext<T> {
  options: T;
}

export type LocatorDefinition = {
  [K in keyof LocatorRegistry]: { type: K } & LocatorRegistry[K];
}[keyof LocatorRegistry];

// deno-lint-ignore no-empty-interface
export interface LocatorRegistry {}

export interface CodecMap {
  string: FieldCodec<StringField, StringNode>;
  asset: FieldCodec<AssetField, AssetNode>;
  map: FieldCodec<MapField, MapNode>;
  boolean: FieldCodec<BooleanField, BooleanNode>;
  number: FieldCodec<NumberField, NumberNode>;
  instance: FieldCodec<InstanceField>;
  list: FieldCodec<ListField, ListNode>;
  markdown: FieldCodec<MarkdownField, MarkdownNode>;
  reference: FieldCodec<ReferenceField, ReferenceNode>;
  datetime: FieldCodec<DatetimeField, DatetimeNode>;
  union: FieldCodec<UnionField, UnionNode>;
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

export interface FieldCodec<T extends Field = Field, U extends Node = Node> {
  parse(
    structure: Structure,
    field: T,
    ctx: CodecContext,
  ): U | Promise<U>;

  stringify(
    node: U,
    field: T,
    ctx: CodecContext,
  ): Structure | Promise<Structure>;
}

export interface Codec {
  parse(
    structure: Structure,
    field: StringField,
    ctx: CodecContext,
  ): StringNode | Promise<StringNode>;
  parse(
    structure: Structure,
    field: NumberField,
    ctx: CodecContext,
  ): NumberNode | Promise<NumberNode>;
  parse(
    structure: Structure,
    field: BooleanField,
    ctx: CodecContext,
  ): BooleanNode | Promise<BooleanNode>;
  parse(
    structure: Structure,
    field: AssetField,
    ctx: CodecContext,
  ): AssetNode | Promise<AssetNode>;
  parse(
    structure: Structure,
    field: DatetimeField,
    ctx: CodecContext,
  ): DatetimeNode | Promise<DatetimeNode>;
  parse(
    structure: Structure,
    field: ReferenceField,
    ctx: CodecContext,
  ): ReferenceNode | Promise<ReferenceNode>;
  parse(
    structure: Structure,
    field: ListField,
    ctx: CodecContext,
  ): ListNode | Promise<ListNode>;
  parse(
    structure: Structure,
    field: MapField,
    ctx: CodecContext,
  ): MapNode | Promise<MapNode>;
  parse(
    structure: Structure,
    field: UnionField,
    ctx: CodecContext,
  ): UnionNode | Promise<UnionNode>;
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Node | Promise<Node>;
}

export interface CodecContext extends ResolverContext {
  asset: AssetRegistry;
  node: NodeRegistry;
  codec: Codec;
}

export type Model = Field;

export type FormatDefinition = {
  [K in keyof FormatRegistry]: { type: K } & FormatRegistry[K];
}[keyof FormatRegistry];

// deno-lint-ignore no-empty-interface
export interface FormatRegistry {}

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

export interface Locator<T = unknown> {
  search(ctx: LocatorContext<T>): AsyncIterable<URL>;
}

export type StructureValue = string;

export interface StructureObject {
  [k: string]: StructureObject | StructureValue;
}

export type Structure = StructureValue | StructureObject;

export interface FormatterContext<T = unknown> {
  config: Config;
  options: T;
  resource: Resource;
}

export interface Formatter<T = unknown> {
  parse(content: string, ctx: FormatterContext<T>): Structure;

  serialize(content: Structure, ctx: FormatterContext<T>): string;
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
