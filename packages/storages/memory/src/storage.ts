import type { Storage } from "@cosmos/core";
import { Buffer, toArrayBuffer } from "@std/streams";

export class MemoryStorage implements Storage {
  #map: Map<string, Uint8Array> = new Map();

  read(url: URL): ReadableStream<Uint8Array> {
    const content = this.#map.get(url.toString());

    if (!content) throw new Error();

    return new Buffer(content).readable;
  }

  async write(url: URL, conetnt: ReadableStream<Uint8Array>): Promise<void> {
    const buffer = await toArrayBuffer(conetnt);
    const u8 = new Uint8Array(buffer);

    this.#map.set(url.toString(), u8);
  }

  delete(url: URL): void {
    this.#map.delete(url.toString());
  }
}
