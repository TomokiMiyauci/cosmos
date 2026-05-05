// import { join, toFileUrl } from "@std/path";
import type { Locator, LocatorContext } from "@cosmos/core";
import { Glob } from "@miyauci/glob";
import { DenoAdaptor } from "./deno.ts";

export class FsLocator implements Locator {
  #glob: Glob = new Glob(new DenoAdaptor());

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
