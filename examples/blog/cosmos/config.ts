import type { Config } from "@cosmos/core";
import { author, post, setting } from "./models/model.ts";
import { FrontmatterFormatterDefinition } from "@cosmos/formatter-frontmatter";
import { JsonFormatterDefinition } from "@cosmos/formatter-json";
import { YamlFormatterDefinition } from "@cosmos/formatter-yaml";
import { TextFormatterDefinition } from "@cosmos/formatter-text";
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
  formatters: [
    new FrontmatterFormatterDefinition(),
    new JsonFormatterDefinition(),
    new YamlFormatterDefinition(),
    new TextFormatterDefinition(),
  ],
  converters: {
    asset: new PathConverter(rootDir),
    reference: new PathConverter(rootDir),
  },
  field: {
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
      type: "document",
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
      entity: "collection",
    },
    authors: {
      type: "document",
      format: { type: "json" },
      model: "author",
      entity: "collection",
    },
    setting: {
      type: "document",
      format: { type: "json" },
      model: "setting",
      entity: "singleton",
    },
    assets: {
      type: "asset",
    },
  },

  sources: {
    posts: new FsIndexer(rootDir, {
      patterns: "/contents/posts/**/*.md",
    }),
    authors: new FsIndexer(rootDir, {
      patterns: "/contents/authors/**/*.json",
    }),
    assets: new FsIndexer(rootDir, {
      patterns: "/contents/**/*.png",
    }),
    setting: new FsIndexer(rootDir, {
      patterns: "/contents/setting.json",
    }),
  },
} satisfies Config;
