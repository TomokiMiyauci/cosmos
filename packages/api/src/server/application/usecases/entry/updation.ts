import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type EntryInputDto, toNode } from "../../dto.ts";

export interface UpdateCommand extends EntryInputDto {
  id: string;
}

export class EntryUpdateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    command: UpdateCommand,
  ): Promise<Result<void, Error>> {
    const [entryId, entryFactoryError] = EntryId.from(command.id);

    if (entryFactoryError) return Result.error(new Error("invalid id"));

    const [entryName, entryNameError] = EntryName.of(command.name);

    if (entryNameError) return Result.error(new Error());

    const maybeCurrentEntry = await this.repositry.findById(entryId);

    if (!maybeCurrentEntry) return Result.error(new Error());

    const currentModel = maybeCurrentEntry.modelId;

    const entry = Entry.of(
      entryId,
      entryName,
      currentModel,
      toNode(command.node),
    );

    await this.repositry.save(entry);

    return Result.ok(undefined);
  }
}
