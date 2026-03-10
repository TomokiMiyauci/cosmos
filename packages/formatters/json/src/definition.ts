import type { FormatterDefinition } from "@cosmos/core";
import { JSONFormatter } from "../src/formatter.ts";

export class JsonFormatterDefinition implements FormatterDefinition {
  type = "json";
  formatter = new JSONFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    // deno-lint-ignore ban-types
    json: {};
  }
}
