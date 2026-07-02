import { EntryId } from "../../../domain/entry/id.ts";
import { Entry } from "../../../domain/entry/model.ts";
import type {
  EntryContext,
  EntryRepositry,
} from "../../../domain/entry/repositry.ts";
import type { Node } from "../../../types/node.ts";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry, private ctx: EntryContext) {}

  async execute(node: Node): Promise<void> {
    const id = EntryId.new();
    const entry = Entry.of(id, node);

    await this.repositry.save(entry, this.ctx);
  }
}
