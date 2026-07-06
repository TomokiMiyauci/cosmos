import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  type Node,
} from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    name: string,
    node: Node,
  ): Promise<Result<Entry, Error>> {
    const id = EntryId.new();
    const nameResult = EntryName.of(name);

    if (!nameResult.ok) return Result.error(new Error());

    const entry = Entry.of(id, nameResult.value, node);

    await this.repositry.save(entry);

    return Result.ok(entry);
  }
}
