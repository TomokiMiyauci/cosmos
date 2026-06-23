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

  async search(query: IndexQuery): Promise<IndexEntry[]> {
    const promise = this.#store[Symbol.asyncIterator]();

    const all = await Array.fromAsync(promise);

    if (query.resource) {
      return all.filter(([_, index]) => index.resource === query.resource);
    }
    return all;
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

    const url = URL.canParse(value.path)
      ? new URL(value.path)
      : new URL(value.path, this.url);

    return {
      url,
      resource: value.resource,
    };
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

    record[id] = {
      path: index.url.href,
      resource: index.resource,
    };

    const newRecord = stringify(record);

    await Deno.writeTextFile(this.url, newRecord);
  }

  async *[Symbol.asyncIterator](): AsyncIterable<[string, Index]> {
    const result = await Deno.readTextFile(this.url);

    const record = parse(result);

    for (const [id, indexValue] of Object.entries(record)) {
      const url = new URL(indexValue.path, this.url);

      yield [id, { url, resource: indexValue.resource }];
    }
  }
}

class NotFoundError extends Error {}

interface IndexValue {
  path: string;
  resource: string;
}

function parse(value: string): IndexRecord {
  return JSON.parse(value);
}

function stringify(record: IndexRecord): string {
  return JSON.stringify(record);
}

type IndexRecord = Record<string, IndexValue>;
