import { EntryId, type EntryRepositry } from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryDeleteUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: string): Promise<Result<void, Error>> {
    const [entryId, error] = EntryId.from(id);

    if (error) return Result.error(new Error());

    await this.repositry.delete(entryId);

    return Result.ok(undefined);
  }
}
