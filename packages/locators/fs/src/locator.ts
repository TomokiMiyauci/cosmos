import type { Locator, LocatorContext } from "@cosmos/core";
import { Glob, type ScannerAdapter } from "@miyauci/glob";

export class FsLocator implements Locator {
  #glob: Glob;

  constructor(adaptor: ScannerAdapter) {
    this.#glob = new Glob(adaptor);
  }

  async *search(
    ctx: LocatorContext,
  ): AsyncIterable<URL> {
    const { patterns } = ctx.option as FsOptions;

    for (const pattern of patterns) {
      const url = new URL(pattern, ctx.base);
      const entries = this.#glob.scan(url);

      for await (const entry of entries) {
        if (entry.type === "file") {
          yield entry.url;
        }
      }
    }
  }
}

export interface FsOptions {
  patterns: string[];
}
