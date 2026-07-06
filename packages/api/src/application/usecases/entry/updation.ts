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
  ): Promise<Result<void, Error>> {
    const idResult = EntryId.from(id);

    if (!idResult.ok) return Result.error(new Error("invalid id"));

    const nameResult = EntryName.of(name);

    if (!nameResult.ok) return Result.error(new Error());

    const entry = Entry.of(idResult.value, nameResult.value, node);

    await this.repositry.save(entry);

    return Result.ok(undefined);
  }
}
