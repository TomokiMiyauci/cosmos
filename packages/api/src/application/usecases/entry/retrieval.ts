import type { E as Entry, EntryId, EntryRepositry } from "@cosmos/core";
import type { Option } from "@miyauci/util";

export class EntryRetrievalUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: EntryId): Promise<Option<Entry>> {
    return await this.repositry.findById(id);
  }
}
