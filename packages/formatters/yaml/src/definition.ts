import type { FormatterDefinition } from "@cosmos/core";
import { YamlFormatter } from "../src/formatter.ts";

export class YamlFormatterDefinition implements FormatterDefinition {
  type = "yaml";
  formatter = new YamlFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    // deno-lint-ignore ban-types
    yaml: {};
  }
}
