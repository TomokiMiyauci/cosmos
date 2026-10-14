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

interface InterpretError {
  paths: Path[];
}

type Path = string;

export class HtmlIoInterpreter {
  interpret(
    input: Input,
    schema: Schema,
  ): Result<SchemaValue, InterpretError[]> {
    switch (schema.type) {
      case "string": {
        return this.interpretString(input);
      }
      case "number": {
        return this.interpretNumber(input);
      }
      case "boolean": {
        return this.interpretBoolean(input);
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

  private interpretString(input: Input): Result<SchemaValue, InterpretError[]> {
    if (typeof input !== "string") return Result.error([{ paths: [] }]);

    return Result.ok(input);
  }

  private interpretNumber(input: Input): Result<SchemaValue, InterpretError[]> {
    if (typeof input !== "string") return Result.error([{ paths: [] }]);

    const [num, numError] = parseNumber(input);

    if (numError) return Result.error([{ paths: [] }]);

    const [value, valueError] = NumberValue.of(num);

    if (valueError) return Result.error([{ paths: [] }]);

    return Result.ok(value);
  }

  private interpretBoolean(
    input: Input,
  ): Result<SchemaValue, InterpretError[]> {
    if (input === "true") return Result.ok(true);
    if (input === "false") return Result.ok(false);

    return Result.error([{ paths: [] }]);
  }

  private interpretReference(
    input: Input,
  ): Result<SchemaValue, InterpretError[]> {
    if (typeof input !== "string") return Result.error([{ paths: [] }]);

    const [data, error] = Identifier.of(input);

    if (error) return Result.error([{ paths: [] }]);

    return Result.ok(data);
  }

  private interpretSequence(
    input: Input,
    schema: SequenceSchema,
  ): Result<SchemaValue, InterpretError[]> {
    if (!Array.isArray(input)) return Result.error([{ paths: [] }]);

    const items: SequenceValue<SchemaValue> = [];
    const errors: InterpretError[] = [];

    for (const [index, item] of input.entries()) {
      const [data, error] = this.interpret(item, schema.item);

      if (error) {
        const thisErrors = error.map(({ paths }) => ({
          paths: paths.concat(index.toString()),
        }));

        errors.push(...thisErrors);
      } else {
        items.push(data);
      }
    }

    if (errors.length) {
      return Result.error(errors);
    }

    return Result.ok(items);
  }

  private interpretMap(
    input: Input,
    schema: MapSchema,
  ): Result<SchemaValue, InterpretError[]> {
    if (typeof input === "object" && !Array.isArray(input)) {
      const value: Record<string, SchemaValue> = {};
      const errors: InterpretError[] = [];

      for (const [key, childSchema] of Object.entries(schema.properties)) {
        const childValue = input[key];

        if (childValue === undefined) continue;

        const [data, error] = this.interpret(childValue, childSchema);

        if (error) {
          const thisErrors = error.map(({ paths }) => ({
            paths: paths.concat(key),
          }));
          errors.push(...thisErrors);
        } else {
          value[key] = data;
        }
      }

      if (errors.length) {
        return Result.error(errors);
      }

      return Result.ok(value);
    }

    return Result.error([{ paths: [] }]);
  }
}

function parseNumber(value: string): Result<number, SyntaxError> {
  return Result.ok(Number(value));
}
