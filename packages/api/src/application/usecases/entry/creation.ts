import {
  E as Entry,
  EntryId,
  EntryModel,
  EntryName,
  type EntryRepositry,
  type Node,
} from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    name: string,
    model: string,
    node: Node,
  ): Promise<Result<Entry, Error>> {
    const id = EntryId.new();
    const maybeName = EntryName.of(name);

    if (!maybeName.ok) return Result.error(new Error());

    const maybeModel = EntryModel.of(model);

    if (!maybeModel.ok) return Result.error(new Error());

    const entry = Entry.of(id, maybeName.value, maybeModel.value, node);

    await this.repositry.save(entry);

    return Result.ok(entry);
  }
}
