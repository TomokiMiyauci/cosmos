import type { Config } from "@cosmos/core";
import { author, post, setting } from "./models/model.ts";
import { FrontmatterFormatter } from "@cosmos/formatter-frontmatter";
import { JsonFormatter } from "@cosmos/formatter-json";
import { YamlFormatter } from "@cosmos/formatter-yaml";
import { TextFormatter } from "@cosmos/formatter-text";
import { DenoIO } from "@cosmos/storage-fs/deno";
import { FsStorage } from "@cosmos/storage-fs";
import { AssetCodec } from "@cosmos/codec-asset";
import { StringCodec } from "@cosmos/codec-string";
import { MapCodec } from "@cosmos/codec-map";
import { BooleanCodec } from "@cosmos/codec-boolean";
import { NumberCodec } from "@cosmos/codec-number";
import { ListCodec } from "@cosmos/codec-list";
import { InstanceCodec } from "@cosmos/codec-instance";
import { MarkdownCodec } from "@cosmos/codec-markdown";
import { ReferenceCodec } from "@cosmos/codec-reference";
import { DatetimeCodec } from "@cosmos/codec-datetime";
import { UnionCodec } from "@cosmos/codec-union";
import { FsIndexer } from "@cosmos/index-fs";
import { resolve } from "@std/path";
import { PathConverter } from "@cosmos/converter-path";

const rootDir = resolve(import.meta.dirname!, "..");

export default {
  models: {
    post,
    author,
    setting,
  },
  storage: new FsStorage(new DenoIO()),
  formats: {
    text: new TextFormatter(),
    yaml: new YamlFormatter(),
    frontmatter: new FrontmatterFormatter(),
    json: new JsonFormatter(),
  },
  converters: {
    asset: new PathConverter(rootDir),
    reference: new PathConverter(rootDir),
  },
  codec: {
    string: new StringCodec(),
    asset: new AssetCodec(),
    map: new MapCodec(),
    boolean: new BooleanCodec(),
    number: new NumberCodec(),
    instance: new InstanceCodec(),
    list: new ListCodec(),
    markdown: new MarkdownCodec(["post"]),
    reference: new ReferenceCodec(),
    datetime: new DatetimeCodec(),
    union: new UnionCodec(),
  },
  resources: {
    posts: {
      model: "post",
      type: "collection",
      main: "body",
    },
    authors: {
      model: "author",
      type: "collection",
    },
    setting: {
      model: "setting",
      type: "singleton",
    },
  },

  sources: [
    {
      resource: "posts",
      indexer: new FsIndexer(rootDir, {
        patterns: "/contents/posts/**/*.md",
      }),
      format: {
        type: "frontmatter",
        header: {
          type: "yaml",
        },
        body: {
          type: "text",
        },
      },
    },
    {
      resource: "authors",
      indexer: new FsIndexer(rootDir, {
        patterns: "/contents/authors/**/*.json",
      }),
      format: { type: "json" },
    },
    {
      resource: "setting",
      indexer: new FsIndexer(rootDir, {
        patterns: "/contents/setting.json",
      }),
      format: { type: "json" },
    },
  ],
  assets: {
    assets: {
      indexer: new FsIndexer(rootDir, {
        patterns: "/contents/**/*.png",
      }),
    },
  },
} satisfies Config;
