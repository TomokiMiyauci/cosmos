import { Result } from "@miyauci/util";
import type {
  BooleanSchema,
  MapSchema,
  NumberSchema,
  ReferenceSchema,
  Schema,
  SequenceSchema,
  StringSchema,
  TemporalSchema,
  UnionSchema,
} from "@cosmos/schema";

export interface ValidationError {
  reason: "invalid_type" | "required";
  path: Path;
}

type PathSegment = string | number;

export type Path = PathSegment[];

export type Input =
  | string
  | number
  | boolean
  | Input[]
  | { [k: string]: Input };

export function validate(
  input: Input,
  schema: Schema,
): Result<void, ValidationError[]> {
  switch (schema.type) {
    case "string":
      return validateString(input, schema);

    case "number":
      return validateNumber(input, schema);

    case "boolean":
      return validateBoolean(input, schema);

    case "temporal":
      return validateTemporal(input, schema);

    case "map":
      return validateMap(input, schema);

    case "sequence":
      return validateSequence(input, schema);

    case "reference":
      return validateReference(input, schema);

    case "union":
      return validateUnion(input, schema);
  }
}

function validateString(
  input: Input,
  _: StringSchema,
): Result<void, ValidationError[]> {
  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  return Result.ok(void 0);
}

function validateNumber(
  input: Input,
  _: NumberSchema,
): Result<void, ValidationError[]> {
  if (typeof input !== "number") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  return Result.ok(void 0);
}

function validateBoolean(
  input: Input,
  _: BooleanSchema,
): Result<void, ValidationError[]> {
  if (typeof input !== "boolean") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  return Result.ok(void 0);
}

function validateTemporal(
  input: Input,
  _: TemporalSchema,
): Result<void, ValidationError[]> {
  // TODO: format check
  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  return Result.ok(void 0);
}

function validateMap(
  input: Input,
  schema: MapSchema,
): Result<void, ValidationError[]> {
  if (
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [...collectMapSchemaViolations(input, schema)];

  if (errors.length) {
    return Result.error(errors);
  }

  return Result.ok(void 0);
}
function* collectMapSchemaViolations(
  input: Record<string, Input>,
  schema: MapSchema,
): IterableIterator<ValidationError> {
  for (const [key, childSchema] of Object.entries(schema.properties)) {
    const value = input[key];
    if (value === undefined) {
      if (schema.required.includes(key)) {
        yield { reason: "required", path: [key] };
      }
      continue;
    }
    const [_, errors] = validate(value, childSchema);

    if (errors) {
      for (const error of errors) {
        yield { reason: error.reason, path: [key, ...error.path] };
      }
    }
  }
}

function validateSequence(
  input: unknown,
  schema: SequenceSchema,
): Result<void, ValidationError[]> {
  if (!Array.isArray(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [...collectSequenseSchemaViolations(input, schema)];

  if (errors.length) {
    return Result.error(errors);
  }

  return Result.ok(void 0);
}

function* collectSequenseSchemaViolations(
  input: Input[],
  schema: SequenceSchema,
): IterableIterator<ValidationError> {
  for (const [index, value] of input.entries()) {
    const [_, errors] = validate(value, schema.item);

    if (errors) {
      for (const error of errors) {
        yield { reason: error.reason, path: [index, ...error.path] };
      }
    }
  }
}

function validateReference(
  input: Input,
  _: ReferenceSchema,
): Result<void, ValidationError[]> {
  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  return Result.ok(void 0);
}

function validateUnion(
  input: Input,
  schema: UnionSchema,
): Result<void, ValidationError[]> {
  for (const member of schema.members) {
    const [_, memberErrors] = validate(input, member);

    if (!memberErrors) {
      return Result.ok(void 0);
    }
  }

  // TODO
  return Result.error([]);
}
