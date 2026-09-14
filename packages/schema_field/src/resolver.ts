import type { Resolver } from "react-hook-form";
import type { Schema, SchemaValue } from "@cosmos/schema";
import { HtmlIoInterpreter, Unknown } from "./interpreter.ts";
import { validate } from "@cosmos/validator";

const interpreter = new HtmlIoInterpreter();

export function cosmosResolver(
  schema: Schema,
): Resolver<FormValues, unknown, SchemaValue> {
  return (values) => {
    const normalized = normalize(values);

    if (normalized === null) {
      return { values: {}, errors: { content: { message: "Error" } } as any };
    }

    const result = interpreter.interpret(normalized, schema);

    if (result instanceof Unknown) {
      return { values: {}, errors: { content: { message: "Error" } } as any };
    }

    const [_, errors] = validate(result, schema);

    if (errors) {
      const e = errors.map((error) => ({
        message: error.reason,
        path: error.path,
      }));
      const errorMap = toErrors(e);

      return {
        values: {},
        errors: {
          content: errorMap,
        } as any,
      };
    }

    return {
      values: result,
      errors: {} as any,
    };
  };
}

interface ErrorNode {
  message?: string;
  [key: string]: ErrorNode | string | undefined;
}

type Path = readonly (string | number)[];

interface Error {
  path: Path;
  message: string;
}

function toErrors(errors: readonly Error[]): ErrorNode {
  const root: ErrorNode = {};

  for (const { path, message } of errors) {
    let current = root;

    for (const key of path) {
      current[key] ??= {};
      current = current[key] as ErrorNode;
    }

    current.message = message;
  }

  return root;
}

type Primitive = string;

export type Value = Value[] | Primitive | {
  [k: string]: Value;
};

interface FormValues {
  content: undefined | NativeFormValue;
}

export type NativeFormPrimitiveValue = Primitive | null;

export type NativeFormValue = NativeFormPrimitiveValue | {
  [k: string]: NativeFormValue | undefined;
} | NativeFormValue[];

export function normalize(value: FormValues): Value | null {
  const { content } = value;

  if (content === undefined) return null;

  return normalizeNativeFormValue(content);
}

export function normalizeNativeFormValue(value: NativeFormValue): Value | null {
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map(normalizeNativeFormValue).filter(isNonNullable);
  } else if (typeof value === "object") {
    const result: Record<string, Value> = {};

    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        const value = normalizeNativeFormValue(val);

        if (value !== null) result[key] = value;
      }
    }

    return result;
  } else {
    return value;
  }
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
