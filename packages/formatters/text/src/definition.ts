import type { Formatter, FormatterDefinition } from "@cosmos/core";
import { TextFormatter } from "../src/formatter.ts";

export class TextFormatterDefinition implements FormatterDefinition {
  type = "text";
  formatter: Formatter = new TextFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    // deno-lint-ignore ban-types
    text: {};
  }
}
