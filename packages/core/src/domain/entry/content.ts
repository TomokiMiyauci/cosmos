import { mapValues } from "@std/collections/map-values";

export type EntryContent =
  | string
  | FiniteNumber
  | boolean
  | ContentList
  | ContentMap;

export interface ContentMap {
  [k: string]: EntryContent;
}
export type ContentList = EntryContent[];

// deno-lint-ignore no-namespace
export namespace EntryContent {
  export function of(input: Input): EntryContent {
    if (typeof input === "number") {
      return FiniteNumber.of(input);
    }

    if (Array.isArray(input)) {
      return input.map(EntryContent.of);
    }

    if (typeof input === "object") {
      const map = mapValues(input, EntryContent.of);

      return map;
    }

    return input;
  }
}

export type Input = string | number | boolean | Input[] | {
  [k: string]: Input;
};

export class FiniteNumber {
  private constructor(value: number) {
    this.#value = value;
  }

  static of(value: number): FiniteNumber {
    if (!Number.isFinite(value)) {
      throw new Error();
    }

    return new FiniteNumber(value);
  }

  #value: number;

  get value(): number {
    return this.#value;
  }
}
