import type { EntryId } from "./id.ts";
import type { Entry } from "./entity.ts";

export interface EntryRepositry {
  save(entry: Entry): Promise<void>;

  findById(id: EntryId): Promise<Entry | null>;

  delete(id: EntryId): Promise<void>;
}
