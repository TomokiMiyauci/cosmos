import type { FormatterDefinition } from "@cosmos/core";
import { TextFormatter, type TextOptions } from "../src/formatter.ts";

export class TextFormatterDefinition implements FormatterDefinition {
  type = "text";
  formatter = new TextFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    text: TextOptions;
  }
}
