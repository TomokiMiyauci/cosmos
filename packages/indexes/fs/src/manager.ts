import { join, toFileUrl } from "@std/path";
import { expandGlob } from "@std/fs";
import type { Indexer } from "@cosmos/core";

export class FsIndexer implements Indexer {
  constructor(private rootDir: string, private options: { pattern: string }) {}

  async *search(): AsyncIterable<URL> {
    const pattern = join(this.rootDir, this.options.pattern);
    const iterator = expandGlob(pattern);

    for await (const entry of iterator) {
      if (entry.isFile) {
        const filePath = entry.path;
        const url = toFileUrl(filePath);

        yield new URL(url);
      }
    }
  }
}
