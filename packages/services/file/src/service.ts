import type { StorageService } from "@cosmos/core";
import { FsStorage } from "@cosmos/storage-fs";

export class FileService extends FsStorage implements StorageService {
  supports(url: URL): boolean {
    return url.protocol === "file:";
  }
}
