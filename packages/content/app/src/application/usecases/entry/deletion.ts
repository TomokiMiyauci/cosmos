import { Entry } from "@cosmos/core";
import { Result } from "@miyauci/util";

export type DeletionError = InvalidIdError;

export interface InvalidIdError {
  type: "INVALID_ID";
}

export class EntryDeleteUseCase {
  constructor(private repositry: Entry.Repositry) {}

  async execute(id: string): Promise<Result<void, DeletionError>> {
    const [entryId, error] = Entry.Id.of(id);

    if (error) return Result.error({ type: "INVALID_ID" });

    await this.repositry.delete(entryId);

    return Result.ok(void 0);
  }
}
