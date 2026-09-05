import { Entry, Model, type Schema } from "@cosmos/core";
import { Result } from "@miyauci/util";
import {
  type ErrorReason,
  type Identifier,
  validate,
  type ValidationError,
} from "@cosmos/validator";

export interface CreateCommand {
  model: string;
  contents: InputContent;
}

export interface UpdateCommand extends CreateCommand {
  id: string;
}

export type InputContent = string | number | boolean | InputContent[] | {
  [k: string]: InputContent;
};

export type CreationError =
  | InvalidIdError
  | ModelNotFoundError
  | SchemaNotFoundError
  | ContentViolationError
  | InvalidModelError;

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

export class EntryRegisterUseCase {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  async execute(
    command: CreateCommand | UpdateCommand,
  ): Promise<Result<string, CreationError>> {
    let id: Entry.Id;

    if ("id" in command) {
      const [entryId, entryIdError] = Entry.Id.of(command.id);

      if (entryIdError) return Result.error({ type: "INVALID_ID" });

      id = entryId;
    } else {
      id = Entry.Id.new();
    }

    const [modelId, modelConstructError] = Model.Id.of(command.model);

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
      command.contents,
      schema.definition,
      (context) => {
        if (context.type === "reference") {
          const id = toEntryId(context.content);

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

    const content = Entry.Content.of(command.contents);

    const entry = Entry.of(id, modelId, content);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}

function toEntryId(identifier: Identifier): Entry.Id {
  const [id, error] = Entry.Id.of(identifier.value);
  // identifier is same value as Entry Id

  if (error) throw new Error("unreachable");

  return id;
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
