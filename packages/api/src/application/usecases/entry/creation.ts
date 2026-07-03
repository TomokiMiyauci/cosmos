import {
  E as Entry,
  type EntryContext,
  EntryId,
  type EntryRepositry,
  type Node,
} from "@cosmos/core";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry, private ctx: EntryContext) {}

  async execute(node: Node): Promise<void> {
    const id = EntryId.new();
    const entry = Entry.of(id, node);

    await this.repositry.save(entry, this.ctx);
  }
}
