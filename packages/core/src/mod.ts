// deno-lint-ignore-file no-namespace
export type {
  Asset,
  AssetEntry,
  AssetHeader,
  AssetLayer,
  AssetMapping,
  Codec,
  CodecContext,
  Converter,
  ConverterContext,
  ConvertMap,
  Datalayer,
  Engine,
  EntityType,
  EntryFilter,
  FormatDefinition,
  Formatter,
  FormatterContext,
  Index,
  IndexEntry,
  Indexer,
  IndexQuery,
  Manifest,
  NodeEntry,
  NodeLayer,
  Protocol,
  ProtocolContext,
  ResolverContext,
  Resource,
  Source,
  Storage,
  Store,
  Structure,
  StructureObject,
  StructureValue,
} from "./types/core.ts";
export type {
  AssetNode,
  BlockContentMapNode,
  BlockquoteMapNode,
  BooleanNode,
  BreakMapNode,
  CodeMapNode,
  DatetimeNode,
  DefinitionContentMapNode,
  DefinitionMapNode,
  DeleteMapNode,
  EmphasisMapNode,
  FootnoteDefinitionMapNode,
  FootnoteReferenceMapNode,
  HeadingMapNode,
  HeadingNodeValue,
  HtmlMapNode,
  ImageMapNode,
  ImageReferenceMapNode,
  InlineCodeMapNode,
  LinkMapNode,
  LinkReferenceMapNode,
  ListContentMapNode,
  ListItemMapNode,
  ListMapNode,
  ListNode,
  LiteralNodeValue,
  MapNode,
  MarkdownNode,
  NodeValue,
  NumberNode,
  ParagraphMapNode,
  PharasingContentMapNode,
  PhrasingContentListNode,
  ReferenceNode,
  RootNodeListNode,
  RootNodeMapNode,
  RootNodeValue,
  RowContentMapNode,
  StringNode,
  StrongMapNode,
  TableCellMapNode,
  TableContentMapNode,
  TableMapNode,
  TableRowMapNode,
  TextMapNode,
  TextNodeValue,
  ThematicBreakMapNode,
  UnionNode,
  YamlMapNode,
} from "./types/node.ts";
export type {
  AssetSchema,
  BooleanSchema,
  DatetimeSchema,
  InstanceSchema,
  ListSchema,
  MapSchema,
  MarkdownSchema,
  NumberSchema,
  ReferenceSchema,
  StringSchema,
  UnionSchema,
} from "./types/schema.ts";
export { type Node } from "./domain/entry/node.ts";
export type {
  AssetModel,
  BooleanModel,
  DatetimeModel,
  ListModel,
  MapModel,
  MarkdownModel,
  Model,
  NumberModel,
  ReferenceModel,
  StringModel,
  UnionModel,
} from "./types/model.ts";
export { type Content } from "./domain/parser.ts";
import { SchemaInterpreter } from "./domain/schema/interpreter.ts";
import { SchemaId } from "./domain/schema/id.ts";
import type { SchemaRepository } from "./domain/schema/repository.ts";
import { ModelId } from "./domain/model/id.ts";
import type { ModelRepositry } from "./domain/model/repositry.ts";
import type { ModelType } from "./domain/model/entity.ts";
import { EntryId } from "./domain/entry/id.ts";
import type { EntryRepositry } from "./domain/entry/repositry.ts";

export namespace Schema {
  export const Id = SchemaId;

  export type Repository = SchemaRepository;

  export const Interpreter = SchemaInterpreter;
}

export namespace Model {
  export const Id = ModelId;
  export type Repositry = ModelRepositry;
  export type Type = ModelType;
}

export namespace Entry {
  export const Id = EntryId;
  export type Repositry = EntryRepositry;

  export const of = EntryConstructor.of;
}

import { Entry as EntryConstructor } from "./domain/entry/entity.ts";
