import type { EntryId } from "../../../domain/entry/id.ts";
import type { EntryRepositry } from "../../../domain/entry/repositry.ts";

export class EntryDeleteUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: EntryId): Promise<void> {
    await this.repositry.delete(id);
  }
}
