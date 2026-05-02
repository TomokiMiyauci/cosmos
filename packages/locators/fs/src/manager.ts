import { join, toFileUrl } from "@std/path";
import { expandGlob } from "@std/fs";
import type { Locator, LocatorContext } from "@cosmos/core";

export class FsLocator implements Locator {
  constructor(
    private rootDir: string,
  ) {}

  async *search(
    ctx: LocatorContext<FsOptions>,
  ): AsyncIterable<URL> {
    const patterns = wrap(ctx.options.patterns);

    for (const pattern of patterns) {
      const path = join(this.rootDir, pattern);
      const iterator = expandGlob(path);

      for await (const entry of iterator) {
        if (entry.isFile) {
          const filePath = entry.path;
          const url = toFileUrl(filePath);

          yield new URL(url);
        }
      }
    }
  }
}

export interface FsOptions {
  patterns: string | string[];
}

function wrap<T>(value: T): T extends unknown[] ? T : T[] {
  // deno-lint-ignore no-explicit-any
  if (Array.isArray(value)) return value as any;

  // deno-lint-ignore no-explicit-any
  return [value] as any;
}
