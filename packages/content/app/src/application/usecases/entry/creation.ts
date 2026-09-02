import { Entry, Model, type Schema } from "@cosmos/core";
import { Result } from "@miyauci/util";
import { validate, type ValidationError } from "@cosmos/validator";

export interface CreateCommand {
  model: string;
  contents: InputContent;
}

export type InputContent = string | number | boolean | InputContent[] | {
  [k: string]: InputContent;
};

export type CreationError =
  | ModelNotFoundError
  | SchemaNotFoundError
  | ContentViolationError
  | InvalidModelError;

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

type ContentViolation = "INVALID_TYPE";

export class EntryCreateUseCase {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  async execute(
    command: CreateCommand,
  ): Promise<Result<string, CreationError>> {
    const id = Entry.Id.new();

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

    const [_, errors] = validate(command.contents, schema.definition);

    if (errors) {
      const violations = errors.map(vilidationError2Violation);

      return Result.error({ type: "INVALID_CONTENT", violations });
    }

    const content = Entry.Content.of(command.contents);

    const entry = Entry.of(id, modelId, content);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}

function vilidationError2Violation(error: ValidationError): Violation {
  return {
    kind: "INVALID_TYPE",
    path: error.path,
  };
}
