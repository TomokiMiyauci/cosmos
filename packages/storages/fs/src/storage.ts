import type { Storage } from "@cosmos/core";

export class FsStorage implements Storage {
  write(url: URL, conetnt: Uint8Array): void | Promise<void> {
    return Deno.writeFile(url, conetnt);
  }

  read(url: URL): Promise<Uint8Array> {
    return Deno.readFile(url);
  }

  delete(url: URL): Promise<void> {
    return Deno.remove(url);
  }
}
