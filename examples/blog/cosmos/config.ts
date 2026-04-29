import type { Config } from "@cosmos/core";
import { author, post } from "./models/model.ts";
import { FrontmatterFormatterDefinition } from "@cosmos/formatter-frontmatter";
import { JsonFormatterDefinition } from "@cosmos/formatter-json";
import { YamlFormatterDefinition } from "@cosmos/formatter-yaml";
import { TextFormatterDefinition } from "@cosmos/formatter-text";
import { DenoIO } from "@cosmos/storage-fs/deno";
import { FsStorage } from "@cosmos/storage-fs";
import { AssetCodec } from "@cosmos/codec-asset";
import { StringCodec } from "@cosmos/codec-string";
import { MapField } from "@cosmos/codec-map";
import { BooleanCodec } from "@cosmos/codec-boolean";
import { NumberCodec } from "@cosmos/codec-number";
import { ListField } from "@cosmos/codec-list";
import { InstanceField } from "@cosmos/codec-instance";
import { MarkdownCodec } from "@cosmos/codec-markdown";
import { PathReferenceCodec } from "@cosmos/codec-path-reference";
import { DatetimeCodec } from "@cosmos/codec-datetime";
import { UnionField } from "@cosmos/codec-union";
import { FieldCodec } from "@cosmos/field-codec";
import { FsIndexer } from "@cosmos/index-fs";
import { PathResolver } from "@cosmos/resolver-path";
import { resolve } from "@std/path";

const rootDir = resolve(import.meta.dirname!, "..");

export default {
  models: {
    post,
    author,
  },
  storage: new FsStorage(new DenoIO()),
  formatters: [
    new FrontmatterFormatterDefinition(),
    new JsonFormatterDefinition(),
    new YamlFormatterDefinition(),
    new TextFormatterDefinition(),
  ],
  field: new FieldCodec({
    string: new StringCodec(),
    asset: new AssetCodec(rootDir),
    map: new MapField(),
    boolean: new BooleanCodec(),
    number: new NumberCodec(),
    instance: new InstanceField(),
    list: new ListField(),
    markdown: new MarkdownCodec(),
    reference: new PathReferenceCodec(rootDir),
    datetime: new DatetimeCodec(),
    union: new UnionField(),
  }),
  indexes: [
    new FsIndexer(rootDir),
  ],
  assets: [
    {
      indexer: { type: "fs", options: { pattern: "/contents/**/*.png" } },
    },
  ],
  resources: [
    {
      format: {
        type: "frontmatter",
        header: {
          type: "yaml",
        },
        body: {
          type: "text",
        },
        bodyKey: "body",
      },
      model: "post",
      indexer: {
        type: "fs",
        options: {
          pattern: "/contents/posts/**/*.md",
        },
      },
    },
    {
      format: {
        type: "json",
      },
      model: "author",
      indexer: {
        type: "fs",
        options: {
          pattern: "/contents/authors/**/*.json",
        },
      },
    },
  ],
  resolver: new PathResolver(rootDir),
} satisfies Config;
