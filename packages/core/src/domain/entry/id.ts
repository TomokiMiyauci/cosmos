import { Result } from "@miyauci/util";

export class EntryId {
  private constructor(value: string) {
    this.#value = value;
  }

  #value: string;

  // deno-lint-ignore no-misused-new
  static new(): EntryId {
    const id = crypto.randomUUID();

    return new EntryId(id);
  }

  static from(id: string): Result<EntryId, Error> {
    if (!id) {
      return Result.error(new Error("id is empty"));
    }

    return Result.ok(new EntryId(id));
  }

  get value(): string {
    return this.#value;
  }

  equals(other: EntryId): boolean {
    return this.#value === other.value;
  }
}
