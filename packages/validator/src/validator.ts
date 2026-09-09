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

export class TemporalValue {
  private constructor(
    private readonly date: Date,
  ) {}

  static of(date: Date): Result<TemporalValue, SyntaxError> {
    if (Number.isNaN(date.getTime())) {
      return Result.error(new SyntaxError("Invalid date"));
    }

    return Result.ok(new TemporalValue(date));
  }

  get value(): Date {
    return new Date(this.date.getTime());
  }
}

export class Unknown {
  #value: unknown;

  constructor(value: unknown) {
    this.#value = value;
  }

  get value(): unknown {
    return this.#value;
  }
}

export type RawValue =
  | string
  | NumberValue
  | boolean
  | TemporalValue
  | Identifier
  | RawValue[]
  | MapValue<RawValue>
  | Unknown;

interface MapValue<T> {
  [k: string]: T;
}

export interface Interpreter<T> {
  interpret(input: T, schema: Schema): RawValue;
}

export class Parser<T> {
  constructor(private interpreter: Interpreter<T>) {}

  parse(input: T, schema: Schema): Result<void, ValidationError[]> {
    const rawValue = this.interpreter.interpret(input, schema);

    return validate(rawValue, schema);
  }
}

export interface ValidationError {
  reason: ErrorReason;
  path: Path;
}

export type ErrorReason = "invalid_type" | "required" | "invalid_value";

type PathSegment = string | number;

export type Path = PathSegment[];

interface ContentValueMap {
  string: string;
  number: NumberValue;
  boolean: boolean;
  temporal: TemporalValue;
  reference: Identifier;
  map: MapValue<Value>;
  sequence: Value[];
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

export function validate(
  input: RawValue,
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
  input: RawValue,
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
  input: RawValue,
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

function isNumberValue(value: unknown): value is NumberValue {
  return value instanceof NumberValue;
}

function isDateValue(value: unknown): value is TemporalValue {
  return value instanceof TemporalValue;
}

function isIdentifier(value: unknown): value is Identifier {
  return value instanceof Identifier;
}

function validateBoolean(
  input: RawValue,
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
  input: RawValue,
  schema: TemporalSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  const path = [] satisfies Path;

  if (!isDateValue(input)) {
    return Result.error([{ reason: "invalid_type", path }]);
  }

  onValidated?.({ type: "temporal", content: input, schema, path });

  return Result.ok(void 0);
}

function validateMap(
  input: RawValue,
  schema: MapSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  if (
    typeof input !== "object" ||
    Array.isArray(input) ||
    isDateValue(input) ||
    isIdentifier(input) ||
    isNumberValue(input) ||
    input instanceof Unknown
  ) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  const errors = [...collectMapSchemaViolations(input, schema, onValidated)];

  if (errors.length) {
    return Result.error(errors);
  }

  onValidated?.({
    type: "map",
    content: input as MapValue<Value>,
    schema,
    path: [],
  });

  return Result.ok(void 0);
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

  onValidated?.({
    type: "sequence",
    content: input as Value[],
    schema,
    path: [],
  });

  return Result.ok(void 0);
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
): Result<void, ValidationError[]> {
  if (!isIdentifier(input)) {
    return Result.error([{ reason: "invalid_type", path: [] }]);
  }

  onValidated?.({ type: "reference", content: input, schema, path: [] });

  return Result.ok(void 0);
}

function validateUnion(
  input: RawValue,
  schema: UnionSchema,
  onValidated?: ValidationCallback,
): Result<void, ValidationError[]> {
  for (const member of schema.members) {
    // TODO
    const [_, memberErrors] = validate(input, member, onValidated);

    if (!memberErrors) {
      onValidated?.({
        type: "union",
        content: input as Value,
        schema,
        path: [],
      });

      return Result.ok(void 0);
    }
  }

  // TODO
  return Result.error([]);
}

export type Value =
  | string
  | NumberValue
  | boolean
  | Value[]
  | MapValue<Value>
  | TemporalValue;

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
