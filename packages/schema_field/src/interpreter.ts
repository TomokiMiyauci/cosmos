import {
  Identifier,
  type MapSchema,
  NumberValue,
  type Schema,
  type SchemaValue,
  type SequenceSchema,
  type SequenceValue,
} from "@cosmos/schema";
import { Result } from "@miyauci/util";

export type Input = string | Input[] | { [k: string]: Input };

type ParsedResult = SchemaValue | Unknown;

export class Unknown {
  #value: unknown;
  constructor(value: unknown) {
    this.#value = value;
  }

  get value(): unknown {
    return this.#value;
  }
}

export class HtmlIoInterpreter {
  interpret(input: Input, schema: Schema): ParsedResult {
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
        return this.interpretSequence(input, schema);
      }
      case "reference": {
        return this.interpretReference(input);
      }
      case "union": {
        throw new Error();
      }
    }
  }

  private interpretNumber(input: Input): ParsedResult {
    if (typeof input !== "string") return new Unknown(input);

    const [num, numError] = parseNumber(input);

    if (numError) return new Unknown(input);

    const [value, valueError] = NumberValue.of(num);

    if (valueError) return new Unknown(input);

    return value;
  }

  private interpretReference(input: Input): ParsedResult {
    if (typeof input !== "string") return new Unknown(input);

    const [data, error] = Identifier.of(input);

    if (error) return new Unknown(input);

    return data;
  }

  private interpretSequence(
    input: Input,
    schema: SequenceSchema,
  ): ParsedResult {
    if (!Array.isArray(input)) return new Unknown(input);

    const items: SequenceValue<SchemaValue> = [];

    for (const item of input) {
      const result = this.interpret(item, schema.item);

      if (result instanceof Unknown) return new Unknown(input);

      items.push(result);
    }

    return items;
  }

  private interpretMap(input: Input, schema: MapSchema): ParsedResult {
    if (typeof input === "object" && !Array.isArray(input)) {
      const value: Record<string, SchemaValue> = {};

      for (const [key, childSchema] of Object.entries(schema.properties)) {
        const childValue = input[key];

        if (childValue === undefined) continue;

        const result = this.interpret(childValue, childSchema);

        if (result instanceof Unknown) return new Unknown(input);

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
