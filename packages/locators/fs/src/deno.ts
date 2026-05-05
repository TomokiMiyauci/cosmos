import type { EntryType, ScannerAdapter, Source } from "@miyauci/glob";

export class DenoAdaptor implements ScannerAdapter {
  async *readDir(url: URL): AsyncIterable<Source> {
    const dir = Deno.readDir(url);

    for await (const dirEntry of dir) {
      yield {
        name: dirEntry.name,
        type: dirEntry.isDirectory
          ? "directory"
          : dirEntry.isSymlink
          ? "symlink"
          : "file",
      };
    }
  }
  async stat(url: URL): Promise<EntryType> {
    const info = await Deno.stat(url);

    return info.isDirectory ? "directory" : info.isSymlink ? "symlink" : "file";
  }
}
