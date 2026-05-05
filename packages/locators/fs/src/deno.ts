import type { Entry, ScannerAdapter } from "@miyauci/glob";

export class DenoAdaptor implements ScannerAdapter {
  async *readDir(url: URL): AsyncIterable<Entry> {
    const dir = Deno.readDir(url);

    for await (const dirEntry of dir) {
      const childUrl = new URL(
        encodeURIComponent(dirEntry.name) + (dirEntry.isDirectory ? "/" : ""),
        url,
      );

      yield {
        name: dirEntry.name,
        url: childUrl,
        type: dirEntry.isDirectory
          ? "directory"
          : dirEntry.isSymlink
          ? "symlink"
          : "file",
      };
    }
  }
  async stat(url: URL): Promise<Entry> {
    const info = await Deno.stat(url);

    return {
      name: url.pathname.split("/").filter(Boolean).pop() ?? "",
      url,
      type: info.isDirectory
        ? "directory"
        : info.isSymlink
        ? "symlink"
        : "file",
    };
  }
}
