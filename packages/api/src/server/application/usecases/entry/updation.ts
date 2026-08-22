import { Entry } from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type EntryInputDto, toNode } from "../../dto.ts";

export interface UpdateCommand extends EntryInputDto {
  id: string;
}

export class EntryUpdateUseCase {
  constructor(private repositry: Entry.Repositry) {}

  async execute(
    command: UpdateCommand,
  ): Promise<Result<void, Error>> {
    const [entryId, entryFactoryError] = Entry.Id.from(command.id);

    if (entryFactoryError) return Result.error(new Error("invalid id"));

    const maybeCurrentEntry = await this.repositry.findById(entryId);

    if (!maybeCurrentEntry) return Result.error(new Error());

    const currentModel = maybeCurrentEntry.modelId;

    const entry = Entry.of(
      entryId,
      currentModel,
      toNode(command.node),
    );

    await this.repositry.save(entry);

    return Result.ok(undefined);
  }
}
