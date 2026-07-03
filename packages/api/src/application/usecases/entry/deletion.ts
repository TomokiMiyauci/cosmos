import type { EntryId, EntryRepositry } from "@cosmos/core";

export class EntryDeleteUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: EntryId): Promise<void> {
    await this.repositry.delete(id);
  }
}
