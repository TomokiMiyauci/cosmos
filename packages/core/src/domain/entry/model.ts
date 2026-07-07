import { Result } from "@miyauci/util";

export class EntryModel {
  readonly #value: string;
  private constructor(value: string) {
    this.#value = value;
  }

  static of(model: string): Result<EntryModel, Error> {
    if (!model) {
      return Result.error(new Error("invalid model"));
    }

    return Result.ok(new EntryModel(model));
  }

  get value(): string {
    return this.#value;
  }
}
