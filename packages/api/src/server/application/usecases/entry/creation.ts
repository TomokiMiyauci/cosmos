import {
  type Content,
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  ModelId,
  type ModelRepositry,
  parse,
} from "@cosmos/core";
import { Result } from "@miyauci/util";

export interface CreateCommand {
  name: string;
  model: string;
  contents: Content;
}

export type CreationError =
  | ModelNotFoundError
  | ContentViolationError
  | InvalidModelError
  | InvalidNameError;

interface ModelNotFoundError {
  type: "MODEL_NOT_FOUND";
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
    private entryRepo: EntryRepositry,
    private modelRepo: ModelRepositry,
  ) {}

  async execute(
    command: CreateCommand,
  ): Promise<Result<string, CreationError>> {
    const id = EntryId.new();

    const [modelId, modelConstructError] = ModelId.of(command.model);

    if (modelConstructError) {
      return Result.error({ type: "INVALID_MODEL" });
    }
    const [name, nameError] = EntryName.of(command.name);

    if (nameError) {
      return Result.error({ type: "INVALID_NAME" });
    }

    const model = await this.modelRepo.findById(modelId);

    if (!model) return Result.error({ type: "MODEL_NOT_FOUND" });

    const [node, nodeError] = parse(
      command.contents,
      model.schema,
    );

    if (nodeError) {
      return Result.error({ type: "INVALID_CONTENT" });
    }

    const entry = Entry.of(id, name, modelId, node);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}
