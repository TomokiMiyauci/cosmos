import {
  Identifier,
  type Interpreter,
  NumberValue,
  type RawValue,
  Unknown,
} from "@cosmos/validator";
import type { MapSchema, Schema, SequenceSchema } from "@cosmos/schema";
import { Result } from "@miyauci/util";

export type Input = string | Input[] | { [k: string]: Input };

export class HtmlIoInterpreter implements Interpreter<Input> {
  interpret(input: Input, schema: Schema): RawValue {
    switch (schema.type) {
      case "string": {
        if (typeof input !== "string") return new Unknown(input);

        return input;
      }
      case "number": {
        return this.interpretNumber(input);
      }
      case "boolean": {
        if (input === "true") return true;
        if (input === "false") return false;

        return new Unknown(input);
      }
      case "map": {
        return this.interpretMap(input, schema);
      }
      case "sequence": {
        return this.interpretSequense(input, schema);
      }
      case "reference": {
        return this.interpretReference(input);
      }
      case "union": {
        throw new Error();
      }
    }
  }

  private interpretNumber(input: Input): RawValue {
    if (typeof input !== "string") return new Unknown(input);

    const [num, numError] = parseNumber(input);

    if (numError) return new Unknown(input);

    const [value, valueError] = NumberValue.of(num);

    if (valueError) return new Unknown(input);

    return value;
  }

  private interpretReference(input: Input): RawValue {
    if (typeof input !== "string") return new Unknown(input);

    const [data, error] = Identifier.of(input);

    if (error) return new Unknown(input);

    return data;
  }

  private interpretSequense(input: Input, schema: SequenceSchema): RawValue {
    if (!Array.isArray(input)) return new Unknown(input);

    return input.map((child) => this.interpret(child, schema.item));
  }

  private interpretMap(input: Input, schema: MapSchema): RawValue {
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
}

function parseNumber(value: string): Result<number, SyntaxError> {
  return Result.ok(Number(value));
}
