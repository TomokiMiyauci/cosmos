import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  type M as Model,
  ModelId,
  type ModelRepositry,
  type Node,
} from "@cosmos/core";
import { Result } from "@miyauci/util";

export interface CreateCommand {
  name: string;
  model: string;
  // node: NodeJson;
  contents: Contents;
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

enum Violation {
  Empty,
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

    const validator = new Validator();
    const [node, nodeError] = await validator.parse(
      model,
      command.contents,
    );

    if (nodeError) {
      return Result.error({ type: "INVALID_CONTENT" });
    }

    const entry = Entry.of(id, name, modelId, node);

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}

class Validator {
  async parse(model: Model, contents: Contents): Promise<Result<Node, Error>> {
    return to(contents, model);
  }
}

export type Contents =
  | StringContents
  | NumberContents
  | BooleanContents
  | RecordContents
  | ListContents
  | KeyedContens;

interface StringContents {
  type: "string";
  value: string;
}

interface NumberContents {
  type: "number";
  value: number;
}

interface BooleanContents {
  type: "boolean";
  value: boolean;
}

interface RecordContents {
  type: "record";
  value: Record<string, Contents>;
}

interface ListContents {
  type: "list";
  value: Contents[];
}

interface KeyedContens {
  type: "keyed";
  key: string;
  value: Contents;
}

function to(contents: Contents, model: Model): Result<Node, Error> {
  switch (model.schema.type) {
    case "string": {
      if (contents.type !== "string") return Result.error(Error());

      return Result.ok({ type: "string", value: contents.value });
    }
    case "number": {
      if (contents.type !== "number") return Result.error(Error());

      return Result.ok({
        type: "number",
        value: contents.value,
      });
    }
  }
}
