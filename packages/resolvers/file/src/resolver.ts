import type { IO, Resolver, Storage } from "@cosmos/core";
import { FsStorage } from "@cosmos/storage-fs";

export class FileResolver implements Resolver {
  storage: Storage;

  constructor() {
    this.storage = new FsStorage();
  }
  resolve(url: URL): IO | void {
    if (url.protocol === "file:") {
      return {
        storage: this.storage,
      };
    }
  }
}
