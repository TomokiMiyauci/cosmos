import { Result } from "@miyauci/util";

export class Identifier {
  #value: string;
  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): Result<Identifier, SyntaxError> {
    if (!value) return Result.error(new SyntaxError("invalid input"));

    return Result.ok(new Identifier(value));
  }

  get value(): string {
    return this.#value;
  }
}

export class NumberValue {
  #value: number;
  private constructor(value: number) {
    this.#value = value;
  }

  static of(value: number): Result<NumberValue, SyntaxError> {
    if (!Number.isFinite(value)) return Result.error(new SyntaxError(""));

    return Result.ok(new NumberValue(value));
  }

  get value(): number {
    return this.#value;
  }
}

export interface MapValue<T> {
  [k: string]: T;
}

export interface SequenseValue<T> extends Array<T> {}

export type StringValue = string;

export type BooleanValue = boolean;

export type SchemaValue =
  | StringValue
  | NumberValue
  | BooleanValue
  | Identifier
  | SequenseValue<SchemaValue>
  | MapValue<SchemaValue>;
