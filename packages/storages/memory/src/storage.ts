import type { Storage } from "@cosmos/core";

export class MemoryStorage implements Storage {
  #map: Map<string, Blob> = new Map();

  read(url: URL): Blob {
    const content = this.#map.get(url.toString());

    if (!content) throw new Error();

    return content;
  }

  write(url: URL, conetnt: Blob): void {
    this.#map.set(url.toString(), conetnt);
  }

  delete(url: URL): void {
    this.#map.delete(url.toString());
  }
}
