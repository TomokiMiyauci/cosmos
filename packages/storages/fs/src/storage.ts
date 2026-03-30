import type { Storage } from "@cosmos/core";
import { extname } from "@std/path";
import { typeByExtension } from "@std/media-types";
import type { IO } from "./type.ts";
import { toArrayBuffer } from "@std/streams";

export class FsStorage implements Storage {
  constructor(private io: IO) {}

  write(url: URL, conetnt: Blob): Promise<void> {
    return this.io.write(url, conetnt.stream());
  }

  async read(url: URL): Promise<Blob> {
    const stream = await this.io.read(url);
    const buffer = await toArrayBuffer(stream);
    const ext = extname(url.pathname);
    const type = typeByExtension(ext);

    return new Blob([buffer], { type });
  }

  delete(url: URL): Promise<void> {
    return this.io.delete(url);
  }
}
