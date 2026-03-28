export class AssetRegistry {
  #map: Map<string, SerializedAssetInfo> = new Map();

  add(url: URL, depentantBy: URL): void {
    if (this.#map.has(url.href)) {
      this.#map.get(url.href)?.depentants.add(depentantBy.href);
    } else {
      this.#map.set(url.href, { depentants: new Set([depentantBy.href]) });
    }
  }

  remove(url: URL): void {
    this.#map.delete(url.href);
  }

  *keys(): IterableIterator<URL> {
    for (const [key] of this.#map) {
      yield new URL(key);
    }
  }

  *[Symbol.iterator](): IterableIterator<AssetEntry> {
    for (const [key, info] of this.#map) {
      yield [new URL(key), {
        depentants: new Set(
          info.depentants.values().map((value) => new URL(value)),
        ),
      }];
    }
  }
}

export interface AssetInfo {
  depentants: Set<URL>;
}

interface SerializedAssetInfo {
  depentants: Set<string>;
}

export type AssetEntry = [id: URL, info: AssetInfo];
