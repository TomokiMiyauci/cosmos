import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  ModelId,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type NodeJson, toNode } from "../../dto.ts";

export interface CreateCommand {
  name: string;
  model: string;
  node: NodeJson;
}

export class EntryCreateUseCase {
  constructor(
    private entryRepo: EntryRepositry,
  ) {}

  async execute(
    command: CreateCommand,
  ): Promise<Result<string, Error>> {
    const id = EntryId.new();
    const [name, error] = EntryName.of(command.name);

    if (error) return Result.error(new Error());

    const [modelId, modelConstructError] = ModelId.of(command.model);

    if (modelConstructError) return Result.error(new Error());

    // const maybeModel = await this.modelRepo.findById(maybeModelId.value);

    // if (!maybeModel.ok) return Result.error(new Error());

    // const isValid = maybeModel.value.validateNode(input.node);

    // if (!isValid) return Result.error(new Error("validation error"));

    const entry = Entry.of(
      id,
      name,
      modelId,
      toNode(command.node),
    );

    await this.entryRepo.save(entry);

    return Result.ok(entry.id.value);
  }
}
