import { Unknown } from "../value.ts";
import type { Interpreter, RawValue } from "../validator.ts";
import {
  type BooleanSchema,
  Identifier,
  type MapSchema,
  type NumberSchema,
  NumberValue,
  type ReferenceSchema,
  type Schema,
  type SequenceSchema,
  type StringSchema,
  type UnionSchema,
} from "@cosmos/schema";

export type Json = string | number | boolean | Json[] | { [k: string]: Json };

export class JsonInterpreter implements Interpreter<Json> {
  interpret(
    input: Json,
    schema: Schema,
  ): RawValue {
    switch (schema.type) {
      case "string":
        return this.interpretString(input, schema);

      case "number":
        return this.interpretNumber(input, schema);

      case "boolean":
        return this.interpretBoolean(input, schema);

      case "reference":
        return this.interpretReference(input, schema);

      case "sequence":
        return this.interpretSequense(input, schema);

      case "map":
        return this.interpretMap(input, schema);

      case "union":
        return this.interpretUnion(input, schema);
    }
  }

  private interpretString(
    input: Json,
    _: StringSchema,
  ): RawValue {
    if (typeof input !== "string") return new Unknown(input);

    return input;
  }

  private interpretNumber(
    input: Json,
    _: NumberSchema,
  ): RawValue {
    if (typeof input !== "number") {
      return new Unknown(input);
    }

    const [data, error] = NumberValue.of(input);

    if (error) {
      return new Unknown(input);
    }

    return data;
  }

  private interpretBoolean(
    input: Json,
    _: BooleanSchema,
  ): RawValue {
    if (typeof input !== "boolean") {
      return new Unknown(input);
    }

    return input;
  }

  private interpretReference(
    input: Json,
    _: ReferenceSchema,
  ): RawValue {
    if (typeof input !== "string") return new Unknown(input);

    const [data, error] = Identifier.of(input);

    if (error) {
      return new Unknown(input);
    }

    return data;
  }

  private interpretSequense(
    input: Json,
    schema: SequenceSchema,
  ): RawValue {
    if (!Array.isArray(input)) return new Unknown(input);

    return input.map((json) => this.interpret(json, schema.item));
  }

  private interpretMap(
    input: Json,
    schema: MapSchema,
  ): RawValue {
    if (typeof input === "object" && !Array.isArray(input)) {
      const value: Record<string, RawValue> = {};

      for (const [key, childSchema] of Object.entries(schema.properties)) {
        const childValue = input[key];

        if (childValue === undefined) continue;

        const result = this.interpret(childValue, childSchema);

        value[key] = result;
      }

      return value;
    }

    return new Unknown(input);
  }

  private interpretUnion(_: Json, __: UnionSchema): never {
    throw new Error("not implemented");
  }
}
