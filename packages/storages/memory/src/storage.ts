import type { Storage } from "@cosmos/core";

export class MemoryStorage implements Storage {
  #map: Map<string, Uint8Array> = new Map();

  read(url: URL): Uint8Array {
    const content = this.#map.get(url.toString());

    if (!content) {
      console.log({
        url,
      });
    }

    if (!content) throw new Error();

    return content;
  }

  write(url: URL, conetnt: Uint8Array): void {
    this.#map.set(url.toString(), conetnt);
  }
}
