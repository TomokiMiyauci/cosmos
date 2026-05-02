interface KV<T, U> {
  key: T;
  value: U;
}

export class HashMap<T, U> implements Map<T, U> {
  #map = new Map<PropertyKey, KV<T, U>>();
  #hashFn: (key: T) => PropertyKey;

  constructor(hashFn: (key: T) => PropertyKey) {
    this.#hashFn = hashFn;
  }

  set(key: T, value: U): this {
    this.#map.set(this.#hashFn(key), { key, value });
    return this;
  }

  get(key: T): U | undefined {
    return this.#map.get(this.#hashFn(key))?.value;
  }

  has(key: T): boolean {
    return this.#map.has(this.#hashFn(key));
  }

  delete(key: T): boolean {
    return this.#map.delete(this.#hashFn(key));
  }

  get size(): number {
    return this.#map.size;
  }

  clear(): void {
    this.#map.clear();
  }

  forEach(
    callbackfn: (value: U, key: T, map: Map<T, U>) => void,
  ): void {
    this.#map.forEach((kv) => {
      callbackfn(kv.value, kv.key, this);
    });
  }

  entries(): MapIterator<[T, U]> {
    return this.#map.entries().map(([_, { key, value }]) => [key, value]);
  }

  keys(): MapIterator<T> {
    return this.#map.values().map(({ key }) => key);
  }

  values(): MapIterator<U> {
    return this.#map.values().map(({ value }) => value);
  }

  getOrInsert(key: T, defaultValue: U): U {
    const value = this.get(key);

    if (value) return value;

    return defaultValue;
  }

  getOrInsertComputed(key: T, callback: (key: T) => U): U {
    const value = this.get(key);

    if (value) return value;

    const newValue = callback(key);

    this.set(key, newValue);

    return newValue;
  }

  *[Symbol.iterator](): MapIterator<[T, U]> {
    const iter = this.#map[Symbol.iterator]();

    for (const [_, { key, value }] of iter) {
      yield [key, value];
    }
  }

  [Symbol.toStringTag]: string = "";
}
