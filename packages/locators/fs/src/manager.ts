import { join, toFileUrl } from "@std/path";
import { expandGlob } from "@std/fs";
import type { Locator, LocatorContext } from "@cosmos/core";

export class FsLocator implements Locator {
  constructor(
    private rootDir: string,
  ) {}

  async *search(
    ctx: LocatorContext,
  ): AsyncIterable<URL> {
    const { patterns } = ctx.option as FsOptions;

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
  patterns: string[];
}
