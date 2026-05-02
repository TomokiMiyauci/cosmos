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
  storage: Storage;
  models: Record<string, Model>;
  converters?: Partial<ConvertMap>;
  assets?: Record<string, Asset>;
}

export interface Asset {
  indexer: Indexer;
}

export interface Source {
  resource: string;
  indexer: Indexer;
  format: FormatDefinition;
}

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

export interface IndexerDefinition {
  type: string;
  options: unknown;
}

export interface Storage {
  read(url: URL): Blob | Promise<Blob>;
  write(url: URL, content: Blob): void | Promise<void>;
  delete(url: URL): void | Promise<void>;
}

export interface Indexer {
  search(): AsyncIterable<URL>;
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

export interface MarkdownSchema extends BaseSchema {
  type: "markdown";
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
  | UnionSchema
  | MarkdownSchema;

export interface ReferenceNode {
  type: ReferenceSchema["type"];
  value: URL;
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

export interface MarkdownNode {
  type: MarkdownSchema["type"];
  value: RootNodeListNode;
}

export type NodeValue =
  | ReferenceNode
  | StringNode
  | NumberNode
  | BooleanNode
  | DatetimeNode
  | AssetNode
  | UnionNode
  | MarkdownNode;

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

export interface TextMapNode extends MapNode {
  value: TextNodeValue;
}

export interface StrongMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "strong";
    };
    children: PhrasingContentListNode;
  };
}

export interface PhrasingContentListNode extends ListNode {
  type: "list";
  value: PharasingContentMapNode[];
}

export interface HeadingMapNode extends MapNode {
  value: HeadingNodeValue;
}

export interface HeadingNodeValue extends Record<string, Node> {
  type: {
    type: "string";
    value: "heading";
  };
  depth: NumberNode;
  children: PhrasingContentListNode;
}

export type PharasingContentMapNode =
  | StrongMapNode
  | TextMapNode
  | LinkMapNode
  | ImageMapNode
  | BreakMapNode
  | DeleteMapNode
  | EmphasisMapNode
  | HtmlMapNode
  | ImageReferenceMapNode
  | InlineCodeMapNode
  | LinkReferenceMapNode
  | FootnoteReferenceMapNode;

export type RootNodeMapNode =
  | PharasingContentMapNode
  | HeadingMapNode
  | ParagraphMapNode
  | BlockquoteMapNode
  | CodeMapNode
  | DefinitionMapNode
  | FootnoteDefinitionMapNode
  | ListMapNode
  | ListItemMapNode
  | TableMapNode
  | TableCellMapNode
  | TableRowMapNode
  | YamlMapNode
  | ThematicBreakMapNode;

export type BlockContentMapNode =
  | BlockquoteMapNode
  | CodeMapNode
  | HeadingMapNode
  | HtmlMapNode
  | ListMapNode
  | ParagraphMapNode
  | TableMapNode
  | ThematicBreakMapNode;

export type ListContentMapNode = ListItemMapNode;

export type TableContentMapNode = TableRowMapNode;
export type RowContentMapNode = TableCellMapNode;

export type DefinitionContentMapNode =
  | DefinitionMapNode
  | FootnoteDefinitionMapNode;

export type RootNodeValue = RootNodeMapNode["value"];

export interface RootNodeListNode extends ListNode {
  value: RootNodeMapNode[];
}

export interface TextNodeValue extends LiteralNodeValue {
  type: {
    type: "string";
    value: "text";
  };
}

export interface ParagraphMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "paragraph";
    };
    children: PhrasingContentListNode;
  };
}

export interface BlockquoteMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "blockquote";
    };
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
  };
}

export interface CodeMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "code";
    };
    lang: StringNode;
    meta: StringNode;
    value: StringNode;
  };
}

export interface DefinitionMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "definition";
    };
    identifier: StringNode;
    label: StringNode;
    title: StringNode;
    url: StringNode | AssetNode | ReferenceNode;
  };
}

export interface FootnoteDefinitionMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "footnoteDefinition";
    };
    identifier: StringNode;
    label: StringNode;
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
  };
}

export interface FootnoteReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "footnoteReference";
    };
    identifier: StringNode;
    label: StringNode;
  };
}

export interface ListMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "list";
    };
    children: {
      type: "list";
      value: ListContentMapNode[];
    };
    ordered: BooleanNode;
    spread: BooleanNode;
    start: NumberNode;
  };
}

export interface ListItemMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "listItem";
    };
    checked: BooleanNode;
    children: {
      type: "list";
      value: (BlockContentMapNode | DefinitionContentMapNode)[];
    };
    spread: BooleanNode;
  };
}

export interface TableMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "table";
    };
    align: {
      type: "list";
      value: {
        type: "string";
        value: "center" | "left" | "right";
      }[];
    };
    children: {
      type: "list";
      value: TableContentMapNode[];
    };
  };
}

export interface TableCellMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "tableCell";
    };
    children: PhrasingContentListNode;
  };
}

export interface TableRowMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "tableRow";
    };
    children: {
      type: "list";
      value: RowContentMapNode[];
    };
  };
}

export interface ThematicBreakMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "thematicBreak";
    };
  };
}

export interface YamlMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "yaml";
    };
    value: StringNode;
  };
}

export interface LiteralNodeValue extends Record<string, Node> {
  value: StringNode;
}

export interface LinkMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "link";
    };
    children: PhrasingContentListNode;
    url: StringNode | AssetNode | ReferenceNode;
  };
}

export interface ImageMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "image";
    };
    url: StringNode | AssetNode | ReferenceNode;
    alt: StringNode;
    title: StringNode;
  };
}

export interface BreakMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "break" };
  };
}

export interface DeleteMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "delete" };
    children: PhrasingContentListNode;
  };
}

export interface EmphasisMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "emphasis" };
    children: PhrasingContentListNode;
  };
}

export interface HtmlMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "html" };
    value: StringNode;
  };
}

export interface ImageReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "imageReference";
    };
    identifier: StringNode;
    alt: StringNode;
    label: StringNode;
    referenceType: { type: "string"; value: ReferenceType };
  };
}

export type ReferenceType = "shortcut" | "collapsed" | "full";

export interface InlineCodeMapNode extends MapNode {
  value: {
    type: { type: "string"; value: "inlineCode" };
    value: StringNode;
  };
}

export interface LinkReferenceMapNode extends MapNode {
  value: {
    type: {
      type: "string";
      value: "linkReference";
    };
    identifier: StringNode;
    label: StringNode;
    referenceType: { type: "string"; value: ReferenceType };
    children: PhrasingContentListNode;
  };
}
