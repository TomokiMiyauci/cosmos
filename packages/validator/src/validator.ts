import { Result } from "@miyauci/util";
import {
  type BooleanSchema,
  type BooleanValue,
  Identifier,
  type MapSchema,
  type MapValue,
  type NumberSchema,
  NumberValue,
  type ReferenceSchema,
  type Schema,
  type SequenceSchema,
  type SequenseValue,
  type StringSchema,
  type StringValue,
  type UnionSchema,
} from "@cosmos/schema";
import { Unknown } from "./value.ts";

export type RawValue =
  | StringValue
  | NumberValue
  | BooleanValue
  | Identifier
  | SequenseValue<RawValue>
  | MapValue<RawValue>
  | Unknown;

export interface Interpreter<T> {
  interpret(input: T, schema: Schema): RawValue;
}

export class Parser<T> {
  constructor(private interpreter: Interpreter<T>) {}

  parse(input: T, schema: Schema): Result<Value, ValidationError[]> {
    const rawValue = this.interpreter.interpret(input, schema);

    return validate(rawValue, schema);
  }
}

export interface ValidationError {
  reason: ErrorReason;
  path: Path;
}

export type ErrorReason =
  | "invalid_type"
  | "required"
  | "invalid_value"
  | "unknown";

type PathSegment = string | number;

export type Path = PathSegment[];

interface ContentValueMap {
  string: StringValue;
  number: NumberValue;
  boolean: BooleanValue;
  reference: Identifier;
  map: MapValue<Value>;
  sequence: SequenseValue<Value>;
  union: Value;
}

export type ValidationContext = {
  [Type in keyof ContentValueMap]: {
    type: Type;
    content: ContentValueMap[Type];
    schema: Extract<Schema, { type: Type }>;
    path: Path;
  };
}[keyof ContentValueMap];

export interface ValidationCallback {
  (context: ValidationContext): void;
}

type WithoutUnknown = Exclude<RawValue, Unknown>;

export function validate(
  input: RawValue,
  schema: Schema,
  onValidated?: ValidationCallback,
): Result<Value, ValidationError[]> {
  if (input instanceof Unknown) {
    return Result.error([{ reason: "unknown", path: [] }]);
  }

  switch (schema.type) {
    case "string":
      return validateString(input, schema, onValidated);

    case "number":
      return validateNumber(input, schema, onValidated);

    case "boolean":
      return validateBoolean(input, schema, onValidated);

    case "map":
      return validateMap(input, schema, onValidated);

    case "sequence":
      return validateSequence(input, schema, onValidated);

    case "reference":
      return validateReference(input, schema, onValidated);

    case "union":
      return validateUnion(input, schema, onValidated);
  }
}

function validateString(
  input: RawValue,
  schema: StringSchema,
  onValidated?: ValidationCallback,
): Result<StringValue, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ content: input, type: "string", schema, path });

  return Result.ok(input);
}

function validateNumber(
  input: RawValue,
  schema: NumberSchema,
  onValidated?: ValidationCallback,
): Result<NumberValue, ValidationError[]> {
  const path = [] satisfies Path;

  if (!isNumberValue(input)) {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "number", content: input, schema, path });

  return Result.ok(input);
}

export function isNumberValue(value: unknown): value is NumberValue {
  return value instanceof NumberValue;
}

export function isIdentifier(value: unknown): value is Identifier {
  return value instanceof Identifier;
}

function validateBoolean(
  input: RawValue,
  schema: BooleanSchema,
  onValidated?: ValidationCallback,
): Result<BooleanValue, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "boolean") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "boolean", content: input, schema, path });

  return Result.ok(input);
}

function validateMap(
  input: WithoutUnknown,
  schema: MapSchema,
  onValidated?: ValidationCallback,
): Result<MapValue<Value>, ValidationError[]> {
  if (
    typeof input !== "object" ||
    Array.isArray(input) ||
    isIdentifier(input) ||
    isNumberValue(input)
  ) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [...collectMapSchemaViolations(input, schema, onValidated)];

  if (errors.length) {
    return Result.error(errors);
  }

  const map = input as MapValue<Value>;

  onValidated?.({
    type: "map",
    content: map,
    schema,
    path: [],
  });

  return Result.ok(map);
}
function* collectMapSchemaViolations(
  input: MapValue<RawValue>,
  schema: MapSchema,
  onValidated?: ValidationCallback,
): IterableIterator<ValidationError> {
  for (const [key, childSchema] of Object.entries(schema.properties)) {
    const value = input[key];
    if (value === undefined) {
      if (schema.required.includes(key)) {
        yield { reason: "required", path: [key] };
      }
      continue;
    }

    const childOnValid = onValidated && withPath(onValidated, key);
    const [_, errors] = validate(value, childSchema, childOnValid);

    if (errors) {
      for (const error of errors) {
        yield { reason: error.reason, path: [key, ...error.path] };
      }
    }
  }
}

function validateSequence(
  input: RawValue,
  schema: SequenceSchema,
  onValidated?: ValidationCallback,
): Result<SequenseValue<Value>, ValidationError[]> {
  if (!Array.isArray(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [
    ...collectSequenseSchemaViolations(input, schema, onValidated),
  ];

  if (errors.length) {
    return Result.error(errors);
  }

  const content = input as Value[];

  onValidated?.({
    type: "sequence",
    content,
    schema,
    path: [],
  });

  return Result.ok(content);
}

function* collectSequenseSchemaViolations(
  input: RawValue[],
  schema: SequenceSchema,
  onValidated?: ValidationCallback,
): IterableIterator<ValidationError> {
  for (const [index, value] of input.entries()) {
    const childOnValid = onValidated && withPath(onValidated, index);
    const [_, errors] = validate(value, schema.item, childOnValid);

    if (errors) {
      for (const error of errors) {
        yield { reason: error.reason, path: [index, ...error.path] };
      }
    }
  }
}

function validateReference(
  input: RawValue,
  schema: ReferenceSchema,
  onValidated?: ValidationCallback,
): Result<Identifier, ValidationError[]> {
  if (!isIdentifier(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  onValidated?.({ type: "reference", content: input, schema, path: [] });

  return Result.ok(input);
}

function validateUnion(
  input: RawValue,
  schema: UnionSchema,
  onValidated?: ValidationCallback,
): Result<Value, ValidationError[]> {
  for (const member of schema.members) {
    // TODO
    const [_, memberErrors] = validate(input, member, onValidated);

    const content = input as Value;

    if (!memberErrors) {
      onValidated?.({
        type: "union",
        content,
        schema,
        path: [],
      });

      return Result.ok(content);
    }
  }

  // TODO
  return Result.error([]);
}

export type Value =
  | StringValue
  | NumberValue
  | BooleanValue
  | SequenseValue<Value>
  | Identifier
  | MapValue<Value>;

function withPath(
  onValidated: ValidationCallback,
  segment: PathSegment,
): ValidationCallback {
  return (context) => {
    onValidated({
      ...context,
      path: [segment, ...context.path],
    });
  };
}
