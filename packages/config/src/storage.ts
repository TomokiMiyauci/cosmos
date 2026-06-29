import type { Storage } from "@cosmos/core";

export class PoolStorage implements Storage {
  constructor(private map: Record<string, Storage>) {}
  write(url: URL, content: Blob): void | Promise<void> {
    const storage = this.#getStorage(url);

    return storage.write(url, content);
  }

  delete(url: URL): void | Promise<void> {
    const storage = this.#getStorage(url);

    return storage.delete(url);
  }

  read(url: URL): Blob | Promise<Blob> {
    const storage = this.#getStorage(url);

    return storage.read(url);
  }

  /**
   * @throws {Error}
   */
  #getStorage(url: URL): Storage {
    const protocol = getProtocol(url);
    const storage = this.map[protocol];

    if (!storage) throw new Error("Storage is not supported");

    return storage;
  }
}

function getProtocol(url: URL): string {
  return url.protocol.replace(/:$/, "");
}
