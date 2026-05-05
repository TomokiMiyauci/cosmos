import { type FsOptions } from "@cosmos/locator-fs";
import type { FrontmatterOptions } from "@cosmos/formatter-frontmatter";

// deno-lint-ignore no-implicit-declare-namespace-export
declare module "@cosmos/core" {
  interface FormatRegistry {
    json: unknown;
    text: unknown;
    yaml: unknown;
    frontmatter: FrontmatterOptions;
  }

  interface LocatorRegistry {
    fs: FsOptions;
  }
}
