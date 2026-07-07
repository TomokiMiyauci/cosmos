import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type EntryInputDto, toNode } from "../../dto.ts";

export class EntryUpdateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    id: string,
    input: EntryInputDto,
  ): Promise<Result<void, Error>> {
    const maybeId = EntryId.from(id);

    if (!maybeId.ok) return Result.error(new Error("invalid id"));

    const nameResult = EntryName.of(input.name);

    if (!nameResult.ok) return Result.error(new Error());

    const entryId = maybeId.value;

    const maybeCurrentEntry = await this.repositry.findById(entryId);

    if (!maybeCurrentEntry.ok) return Result.error(new Error());

    const currentModel = maybeCurrentEntry.value.model;

    const entry = Entry.of(
      entryId,
      nameResult.value,
      currentModel,
      toNode(input.node),
    );

    await this.repositry.save(entry);

    return Result.ok(undefined);
  }
}
