import { join, toFileUrl } from "@std/path";
import { expandGlob } from "@std/fs";
import type { IndexManager } from "@cosmos/core";

export class FsIndexer implements IndexManager {
  constructor(private rootDir: string) {}

  type = "fs";
  async *search(options: unknown): AsyncIterable<URL> {
    const pattern = join(this.rootDir, options.pattern);
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
