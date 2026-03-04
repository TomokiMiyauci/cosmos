import type { Model, RawContent, Storage } from "@cosmos/core";
import { join } from "@std/path";
import { expandGlob } from "@std/fs";

export class FsStorage implements Storage {
  constructor(public rootDir: string) {}
  save(): Promise<void> | void {}

  async fetch(model: Model): Promise<RawContent[]> {
    const base = join(this.rootDir, model.path);
    const iterator = expandGlob(base);

    const entries = await Array.fromAsync(iterator);
    const paths = entries.map((entry) => entry.path);

    const contents = await Promise.all(
      paths.map(async (path) => ({
        path,
        content: await Deno.readTextFile(path),
      })),
    );

    return contents.map(({ content, path }) => ({ content, id: path }));
  }
}
