import type { FormatterDefinition } from "@cosmos/core";
import { JsonFormatter } from "../src/formatter.ts";

export class JsonFormatterDefinition implements FormatterDefinition {
  type = "json";
  formatter = new JsonFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    // deno-lint-ignore ban-types
    json: {};
  }
}
