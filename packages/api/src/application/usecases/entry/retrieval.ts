import { type E as Entry, EntryId, type EntryRepositry } from "@cosmos/core";
import { type Option, Result } from "@miyauci/util";

export class EntryRetrievalUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: string): Promise<Result<Option<Entry>, Error>> {
    const maybeId = EntryId.from(id);

    if (!maybeId.ok) return Result.error(new Error());

    const result = await this.repositry.findById(maybeId.value);

    return Result.ok(result);
  }
}
