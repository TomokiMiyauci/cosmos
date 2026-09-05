import { Entry } from "@cosmos/core";
import { Result } from "@miyauci/util";

export class EntryDeleteUseCase {
  constructor(private repositry: Entry.Repositry) {}

  async execute(id: string): Promise<Result<void, Error>> {
    const [entryId, error] = Entry.Id.of(id);

    if (error) return Result.error(new Error());

    await this.repositry.delete(entryId);

    return Result.ok(undefined);
  }
}
