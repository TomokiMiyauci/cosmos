import type { Asset, Reader } from "@cosmos/core";
import { typeByExtension } from "@std/media-types";
import { extname } from "@std/path";

export class FileReader implements Reader {
  async read(url: URL): Promise<Asset> {
    const fs = await Deno.open(url);

    const ext = extname(url.pathname);
    const mimeType = typeByExtension(ext) ??
      "application/octet-stream";

    return {
      header: { mimeType },
      body: fs.readable,
    };
  }
}
