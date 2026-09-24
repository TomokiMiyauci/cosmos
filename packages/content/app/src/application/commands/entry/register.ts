import { Entry, Model, type Schema } from "~domain";
import { Result } from "@miyauci/util";
import {
  type ErrorReason,
  validate,
  type ValidationError,
} from "@cosmos/validator";
import type { SchemaValue } from "@cosmos/schema";

export interface CreateCommandInput {
  model: string;
  contents: SchemaValue;
}

export interface UpdateCommandInput extends CreateCommandInput {
  id: string;
}

export type CreationError =
  | ModelNotFoundError
  | SchemaNotFoundError
  | ContentViolationError
  | InvalidModelError;

export type UpdatationError =
  | InvalidIdError
  | CreationError;

export interface InvalidIdError {
  type: "INVALID_ID";
}

export interface ModelNotFoundError {
  type: "MODEL_NOT_FOUND";
}

export interface SchemaNotFoundError {
  type: "SCHEMA_NOT_FOUND";
}

export interface InvalidModelError {
  type: "INVALID_MODEL";
}

export interface ContentViolationError {
  type: "INVALID_CONTENT";
  violations: Violation[];
}

export interface Violation {
  kind: ContentViolation;
  path: Path;
}

export type Path = (string | number)[];

export type ContentViolation =
  | "INVALID_TYPE"
  | "REQUIRED"
  | "REFERENCE_NOT_FOUND"
  | "INVALID_VALUE";

export class EntryCreateCommand {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  async execute(
    input: CreateCommandInput,
  ): Promise<Result<string, CreationError>> {
    const id: Entry.Id = Entry.Id.new();
    const now = Temporal.Now.instant();

    const [modelId, modelConstructError] = Model.Id.of(input.model);

    if (modelConstructError) {
      return Result.error({ type: "INVALID_MODEL" });
    }

    const model = await this.modelRepo.findById(modelId);

    if (!model) return Result.error({ type: "MODEL_NOT_FOUND" });

    const schema = await this.schemaRepo.findById(model.schemaId);

    if (!schema) {
      return Result.error({ type: "SCHEMA_NOT_FOUND" });
    }

    const references: IdPath[] = [];

    const [_, errors] = validate(
      input.contents,
      schema.definition,
      (context) => {
        if (context.type === "reference") {
          const id = Entry.Id.fromIdentifier(context.content);

          references.push({ id, path: context.path });
        }
      },
    );

    const notFounds = await validateReferenceExistence(
      references,
      this.entryRepo,
    );
    const allErrors = [
      ...errors?.map(vilidationError2Violation) ?? [],
      ...notFounds,
    ];

    if (allErrors.length) {
      return Result.error({ type: "INVALID_CONTENT", violations: allErrors });
    }

    const entry = Entry.of(id, modelId, input.contents, now, now);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}

export class EntryUpsertCommand {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  async execute(
    input: UpdateCommandInput,
  ): Promise<Result<string, UpdatationError>> {
    const [id, entryIdError] = Entry.Id.of(input.id);

    if (entryIdError) return Result.error({ type: "INVALID_ID" });

    const [modelId, modelConstructError] = Model.Id.of(input.model);

    if (modelConstructError) {
      return Result.error({ type: "INVALID_MODEL" });
    }

    const model = await this.modelRepo.findById(modelId);

    if (!model) return Result.error({ type: "MODEL_NOT_FOUND" });

    const schema = await this.schemaRepo.findById(model.schemaId);

    if (!schema) {
      return Result.error({ type: "SCHEMA_NOT_FOUND" });
    }

    const references: IdPath[] = [];

    const [_, errors] = validate(
      input.contents,
      schema.definition,
      (context) => {
        if (context.type === "reference") {
          const id = Entry.Id.fromIdentifier(context.content);

          references.push({ id, path: context.path });
        }
      },
    );

    const notFounds = await validateReferenceExistence(
      references,
      this.entryRepo,
    );
    const allErrors = [
      ...errors?.map(vilidationError2Violation) ?? [],
      ...notFounds,
    ];

    if (allErrors.length) {
      return Result.error({ type: "INVALID_CONTENT", violations: allErrors });
    }

    const prevEntry = await this.entryRepo.findById(id);
    const now = Temporal.Now.instant();

    const entry = prevEntry
      ? prevEntry.update(modelId, input.contents, now)
      : Entry.of(
        id,
        modelId,
        input.contents,
        now,
        now,
      );

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}

function vilidationError2Violation(error: ValidationError): Violation {
  const kind = reason2Kind(error.reason);

  return {
    kind,
    path: error.path,
  };
}

function reason2Kind(reason: ErrorReason): ContentViolation {
  switch (reason) {
    case "invalid_type":
      return "INVALID_TYPE";
    case "required":
      return "REQUIRED";
    case "invalid_value":
      return "INVALID_VALUE";
  }
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}

interface IdPath {
  id: Entry.Id;
  path: Path;
}

async function validateReferenceExistence(
  idPaths: IdPath[],
  repository: Entry.Repositry,
): Promise<Violation[]> {
  const result = await Promise.all(idPaths.map(async ({ id, path }) => {
    const isExists = await repository.findById(id);

    if (isExists) return null;

    return { kind: "REFERENCE_NOT_FOUND", path } satisfies Violation;
  }));

  return result.filter(isNonNullable);
}
