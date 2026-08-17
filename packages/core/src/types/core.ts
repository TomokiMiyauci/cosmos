import type { EntryRepositry } from "../domain/entry/repositry.ts";
import type { Node } from "./node.ts";
import type { Schema } from "./schema.ts";
import type { Model, ModelRepositry } from "@cosmos/core";

export interface Manifest {
  version: string;
  schemas: Record<string, Schema>;
  resources: Record<string, Resource>;
}

export interface Engine {
  resources: Record<string, Resource>;
  models: Record<string, Model>;
  repositories: {
    entry: EntryRepositry;
    model: ModelRepositry;
  };
  reader: any;
}

export interface Asset {
}

export interface Source {
  resource: string;
  format: FormatDefinition;
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

export interface Codec {
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
  id: string;
  type: EntityType;
  model: string;
  description: string;
}

export type EntityType = "singleton" | "collection";

export interface Storage {
  read(url: URL): Blob | Promise<Blob>;
  write(url: URL, content: Blob): void | Promise<void>;
  delete(url: URL): void | Promise<void>;
}

export type StructureValue = string;

export interface StructureObject {
  [k: string]: StructureObject | StructureValue;
}

export type Structure = StructureValue | StructureObject;

export interface FormatterContext {
  engine: Engine;
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
  engine: Engine;
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
