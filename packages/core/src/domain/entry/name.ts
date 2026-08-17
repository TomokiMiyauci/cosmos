import { Result } from "@miyauci/util";

export class EntryName {
  private constructor(value: string) {
    this.#value = value;
  }

  #value: string;

  static of(name: string): Result<EntryName, SyntaxError> {
    if (!name) {
      return Result.error(new SyntaxError("name is empty"));
    }

    return Result.ok(new EntryName(name));
  }

  get value(): string {
    return this.#value;
  }

  equals(other: EntryName): boolean {
    return this.#value === other.value;
  }
}
