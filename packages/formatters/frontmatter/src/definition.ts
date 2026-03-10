import type { FormatterDefinition } from "@cosmos/core";
import { FrontmatterFormatter, type FrontmatterOptions } from "./formatter.ts";

export class FrontmatterFormatterDefinition implements FormatterDefinition {
  type = "frontmatter";
  formatter = new FrontmatterFormatter();
}

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatterRegistry {
    frontmatter: FrontmatterOptions;
  }
}
