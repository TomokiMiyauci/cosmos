// deno-lint-ignore-file no-undef
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
  type SchemaValue,
  type SequenceSchema,
  type SequenceValue,
  type StringSchema,
  type StringTerm,
  type StringValue,
  type UnionSchema,
} from "@cosmos/schema";

export interface ValidationError {
  reason: ErrorReason;
  path: Path;
}

export type ErrorReason =
  | "invalid_type"
  | "required"
  | "invalid_value";

type PathSegment = string | number;

export type Path = PathSegment[];

interface ContentValueMap {
  string: StringValue;
  number: NumberValue;
  boolean: BooleanValue;
  reference: Identifier;
  map: MapValue<SchemaValue>;
  sequence: SequenceValue<SchemaValue>;
  union: SchemaValue;
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

export function validate(
  input: SchemaValue,
  schema: Schema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
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
  input: SchemaValue,
  schema: StringSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  if (schema.term) {
    const isFormat = isStringTerm(input, schema.term);

    if (!isFormat) {
      return Result.error([{ reason: "invalid_value", path }]);
    }
  }

  onValidated?.({ content: input, type: "string", schema, path });

  return Result.ok(void 0);
}

function isStringTerm(value: string, term: StringTerm): boolean {
  switch (term) {
    case "date": {
      return isDateFormat(value);
    }
    case "datetime": {
      return isDateTimeFormat(value);
    }
  }
}

function isDateFormat(value: string): boolean {
  try {
    Temporal.PlainDate.from(value);

    return true;
  } catch {
    return false;
  }
}

function isDateTimeFormat(value: string): boolean {
  try {
    Temporal.PlainDateTime.from(value);

    return true;
  } catch {
    return false;
  }
}

function validateNumber(
  input: SchemaValue,
  schema: NumberSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (!isNumberValue(input)) {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "number", content: input, schema, path });

  return Result.ok(void 0);
}

export function isNumberValue(value: unknown): value is NumberValue {
  return value instanceof NumberValue;
}

export function isIdentifier(value: unknown): value is Identifier {
  return value instanceof Identifier;
}

function validateBoolean(
  input: SchemaValue,
  schema: BooleanSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "boolean") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "boolean", content: input, schema, path });

  return Result.ok(void 0);
}

function validateMap(
  input: SchemaValue,
  schema: MapSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
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

  const map = input as MapValue<SchemaValue>;

  onValidated?.({
    type: "map",
    content: map,
    schema,
    path: [],
  });

  return Result.ok(void 0);
}
function* collectMapSchemaViolations(
  input: MapValue<SchemaValue>,
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
  input: SchemaValue,
  schema: SequenceSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (!Array.isArray(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [
    ...collectSequenceSchemaViolations(input, schema, onValidated),
  ];

  if (errors.length) {
    return Result.error(errors);
  }

  onValidated?.({ type: "sequence", content: input, schema, path: [] });

  return Result.ok(void 0);
}

function* collectSequenceSchemaViolations(
  input: SequenceValue<SchemaValue>,
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
  input: SchemaValue,
  schema: ReferenceSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (!isIdentifier(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  onValidated?.({ type: "reference", content: input, schema, path: [] });

  return Result.ok(void 0);
}

function validateUnion(
  input: SchemaValue,
  schema: UnionSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  for (const member of schema.members) {
    // TODO
    const [_, memberErrors] = validate(input, member, onValidated);

    if (!memberErrors) {
      onValidated?.({
        type: "union",
        content: input,
        schema,
        path: [],
      });

      return Result.ok(void 0);
    }
  }

  // TODO
  return Result.error([]);
}

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
