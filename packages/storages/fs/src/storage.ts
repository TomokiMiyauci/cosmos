import type { Storage } from "@cosmos/core";

export class FsStorage implements Storage {
  write(url: URL, conetnt: ReadableStream<Uint8Array>): void | Promise<void> {
    return Deno.writeFile(url, conetnt);
  }

  async read(url: URL): Promise<ReadableStream<Uint8Array>> {
    const fs = await Deno.open(url);

    return fs.readable;
  }

  delete(url: URL): Promise<void> {
    return Deno.remove(url);
  }
}
