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

interface ContentValueMap {
  string: string;
  number: number;
  boolean: boolean;
  temporal: string;
  reference: string;
  map: Record<string, Input>;
  sequence: Input[];
  union: Input;
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
  input: Input,
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

    case "temporal":
      return validateTemporal(input, schema, onValidated);

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
  input: Input,
  schema: StringSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ content: input, type: "string", schema, path });

  return Result.ok(void 0);
}

function validateNumber(
  input: Input,
  schema: NumberSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (typeof input !== "number") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "number", content: input, schema, path });

  return Result.ok(void 0);
}

function validateBoolean(
  input: Input,
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

function validateTemporal(
  input: Input,
  schema: TemporalSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  // TODO: format check
  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "temporal", content: input, schema, path });

  return Result.ok(void 0);
}

function validateMap(
  input: Input,
  schema: MapSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [...collectMapSchemaViolations(input, schema, onValidated)];

  if (errors.length) {
    return Result.error(errors);
  }

  onValidated?.({ type: "map", content: input, schema, path: [] });

  return Result.ok(void 0);
}
function* collectMapSchemaViolations(
  input: Record<string, Input>,
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
  input: unknown,
  schema: SequenceSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (!Array.isArray(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [
    ...collectSequenseSchemaViolations(input, schema, onValidated),
  ];

  if (errors.length) {
    return Result.error(errors);
  }

  onValidated?.({ type: "sequence", content: input, schema, path: [] });

  return Result.ok(void 0);
}

function* collectSequenseSchemaViolations(
  input: Input[],
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
  input: Input,
  schema: ReferenceSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (typeof input !== "string") {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  onValidated?.({ type: "reference", content: input, schema, path: [] });

  return Result.ok(void 0);
}

function validateUnion(
  input: Input,
  schema: UnionSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  for (const member of schema.members) {
    // TODO
    const [_, memberErrors] = validate(input, member, onValidated);

    if (!memberErrors) {
      onValidated?.({ type: "union", content: input, schema, path: [] });

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
