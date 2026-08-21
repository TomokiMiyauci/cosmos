import { Result } from "@miyauci/util";

export class SchemaId {
  readonly #value: string;
  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): Result<SchemaId, Error> {
    if (value === "") {
      return Result.error(new Error("invalid schema id"));
    }

    return Result.ok(new SchemaId(value));
  }

  get value(): string {
    return this.#value;
  }
}
