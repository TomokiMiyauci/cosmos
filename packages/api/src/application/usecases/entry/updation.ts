import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  type Node,
} from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryUpdateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    id: string,
    name: string,
    node: Node,
  ): Promise<Result<Entry, Error>> {
    const maybeId = EntryId.from(id);

    if (!maybeId.ok) return Result.error(new Error("invalid id"));

    const nameResult = EntryName.of(name);

    if (!nameResult.ok) return Result.error(new Error());

    const entryId = maybeId.value;

    const maybeCurrentEntry = await this.repositry.findById(entryId);

    if (!maybeCurrentEntry.ok) return Result.error(new Error());

    const currentModel = maybeCurrentEntry.value.model;

    const entry = Entry.of(entryId, nameResult.value, currentModel, node);

    await this.repositry.save(entry);

    return Result.ok(entry);
  }
}
