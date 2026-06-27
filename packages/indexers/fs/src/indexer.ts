import type { Index, IndexEntry, Indexer, IndexQuery } from "@cosmos/core";

export class FsIndexer implements Indexer {
  #store: IndexStore;

  constructor(storePath: URL) {
    this.#store = new JsonIndexStore(storePath);
  }

  resolve(id: string): Promise<Index> {
    return this.#store.get(id);
  }

  register(id: string, index: Index): Promise<void> {
    return this.#store.set(id, index);
  }

  unregister(id: string): Promise<void> {
    return this.#store.delete(id);
  }

  async search(query?: IndexQuery): Promise<IndexEntry[]> {
    const promise = this.#store[Symbol.asyncIterator]();

    const all = await Array.fromAsync(promise);

    if (!query) return all;

    switch (query.type) {
      case "model": {
        return all.filter(([_, index]) => {
          if (index.type === "model") {
            return index.resource === query.resource;
          }
          return false;
        });
      }
      case "asset": {
        return all.filter(([_, index]) => {
          return index.type === "asset";
        });
      }
    }
  }
}

interface IndexStore {
  /**
   * @throws {NotFoundError}
   */
  get(id: string): Promise<Index>;

  set(id: string, index: Index): Promise<void>;

  /**
   * @throws {NotFoundError}
   */
  delete(id: string): Promise<void>;

  [Symbol.asyncIterator](): AsyncIterable<[id: string, Index]>;
}

class JsonIndexStore implements IndexStore {
  constructor(private url: URL) {}

  async get(id: string): Promise<Index> {
    const result = await Deno.readTextFile(this.url);

    const record = parse(result);

    const value = record[id];

    if (!value) throw new NotFoundError();

    switch (value.type) {
      case "asset": {
        return { type: "asset" };
      }
      case "model": {
        const url = URL.canParse(value.path)
          ? new URL(value.path)
          : new URL(value.path, this.url);

        return {
          url,
          resource: value.resource,
          type: "model",
        };
      }
    }
  }

  async delete(id: string): Promise<void> {
    const result = await Deno.readTextFile(this.url);

    const record = parse(result);

    delete record[id];

    const newRecord = stringify(record);

    await Deno.writeTextFile(this.url, newRecord);
  }

  async set(id: string, index: Index): Promise<void> {
    const result = await Deno.readTextFile(this.url);

    const record = parse(result);
    const value: IndexValue = index.type === "asset"
      ? {
        type: "asset",
      }
      : {
        type: "model",
        resource: index.resource,
        path: index.url.href,
      };

    record[id] = value;

    const newRecord = stringify(record);

    await Deno.writeTextFile(this.url, newRecord);
  }

  async *[Symbol.asyncIterator](): AsyncIterable<[string, Index]> {
    const result = await Deno.readTextFile(this.url);

    const record = parse(result);

    for (const [id, indexValue] of Object.entries(record)) {
      switch (indexValue.type) {
        case "model": {
          const url = new URL(indexValue.path, this.url);

          yield [id, { type: "model", url, resource: indexValue.resource }];
          break;
        }
        case "asset": {
          yield [id, { type: "asset" }];
        }
      }
    }
  }
}

class NotFoundError extends Error {}

interface ModelIndexValue {
  type: "model";
  path: string;
  resource: string;
}

interface AssetIndexValue {
  type: "asset";
}

type IndexValue = ModelIndexValue | AssetIndexValue;

function parse(value: string): IndexRecord {
  return JSON.parse(value);
}

function stringify(record: IndexRecord): string {
  return JSON.stringify(record);
}

type IndexRecord = Record<string, IndexValue>;
