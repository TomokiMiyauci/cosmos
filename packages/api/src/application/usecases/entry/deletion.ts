import { EntryId, type EntryRepositry } from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryDeleteUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: string): Promise<Result<void, Error>> {
    const maybeId = EntryId.from(id);

    if (!maybeId.ok) return Result.error(new Error());

    await this.repositry.delete(maybeId.value);

    return Result.ok(undefined);
  }
}
