import type { Locator } from "../type.ts";
import { toFileUrl } from "@std/path";
import { expandGlob } from "@std/fs";

export class FileLocator implements Locator {
  async locate(location: URLPattern): Promise<URL[]> {
    if (location.protocol !== "file") return [];

    const iterator = expandGlob(location.pathname);

    const entries = await Array.fromAsync(iterator);
    const paths = entries.map((entry) => entry.path);

    return paths.map(toFileUrl);
  }
}
