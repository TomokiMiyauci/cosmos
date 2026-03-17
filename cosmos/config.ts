import type { Config } from "@cosmos/core";
import { FsStorage } from "@cosmos/storage-fs";
import { StringFieldCodec } from "@cosmos/field-string";
import { BooleanFieldCodec } from "@cosmos/field-boolean";
import { ReferenceFieldCodec } from "@cosmos/field-reference";
import { JsonFormatterDefinition } from "@cosmos/formatter-json";
import { TextFormatterDefinition } from "@cosmos/formatter-text";
import { YamlFormatterDefinition } from "@cosmos/formatter-yaml";
import { FrontmatterFormatterDefinition } from "@cosmos/formatter-frontmatter";
import { FileLocator } from "@cosmos/core";
import { resolve } from "@std/path";
import post from "./models/post.ts";

export default {
  model: {
    base: {
      protocol: "file",
      pathname: resolve(import.meta.dirname!, "../"),
    },
    models: [post],
  },
  source: new FsStorage(),
  fields: {
    boolean: new BooleanFieldCodec(),
    string: new StringFieldCodec(),
    reference: new ReferenceFieldCodec(),
  },
  formatters: [
    new JsonFormatterDefinition(),
    new TextFormatterDefinition(),
    new FrontmatterFormatterDefinition(),
    new YamlFormatterDefinition(),
  ],
  locator: new FileLocator(),
} satisfies Config;
