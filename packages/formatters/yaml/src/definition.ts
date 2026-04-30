import type { Formatter, FormatterDefinition } from "@cosmos/core";
import { YamlFormatter } from "../src/formatter.ts";

export class YamlFormatterDefinition implements FormatterDefinition {
  type: string = "yaml";
  formatter: Formatter = new YamlFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    // deno-lint-ignore ban-types
    yaml: {};
  }
}
