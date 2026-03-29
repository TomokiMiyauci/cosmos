import type { Storage } from "@cosmos/core";
import { extname } from "@std/path";
import { typeByExtension } from "@std/media-types";

export class FsStorage implements Storage {
  write(url: URL, conetnt: Blob): Promise<void> {
    return Deno.writeFile(url, conetnt.stream());
  }

  async read(url: URL): Promise<Blob> {
    const u8 = await Deno.readFile(url);
    const ext = extname(url.pathname);
    const type = typeByExtension(ext);

    return new Blob([u8], { type });
  }

  delete(url: URL): Promise<void> {
    return Deno.remove(url);
  }
}
