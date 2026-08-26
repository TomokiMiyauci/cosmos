import { Entry, Model, type Schema } from "@cosmos/core";
import { Result } from "@miyauci/util";

export interface CreateCommand {
  model: string;
  contents: Input;
}

type Input = string | number | boolean | Input[] | { [k: string]: Input };

export type CreationError =
  | ModelNotFoundError
  | SchemaNotFoundError
  | ContentViolationError
  | InvalidModelError
  | InvalidNameError;

interface ModelNotFoundError {
  type: "MODEL_NOT_FOUND";
}

interface SchemaNotFoundError {
  type: "SCHEMA_NOT_FOUND";
}

interface InvalidModelError {
  type: "INVALID_MODEL";
}

interface InvalidNameError {
  type: "INVALID_NAME";
}

interface ContentViolationError {
  type: "INVALID_CONTENT";
}

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

    // const [_, nodeError] = this.#interpreter.interpret(
    //   command.contents,
    //   schema,
    // );

    // if (nodeError) {
    //   return Result.error({ type: "INVALID_CONTENT" });
    // }

    const content = Entry.Content.of(command.contents);

    const entry = Entry.of(id, modelId, content);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}
