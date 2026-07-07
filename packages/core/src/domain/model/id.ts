import { Result } from "@miyauci/util";

export class ModelId {
  readonly #value: string;
  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): Result<ModelId, Error> {
    if (!value) {
      return Result.error(new Error("invalid model"));
    }

    return Result.ok(new ModelId(value));
  }

  get value(): string {
    return this.#value;
  }
}
