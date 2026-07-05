import type { EntryId } from "./id.ts";
import type { Entry } from "./model.ts";
import type { Option } from "@miyauci/util";

export interface EntryRepositry {
  save(entry: Entry): Promise<void>;

  findById(id: EntryId): Promise<Option<Entry>>;

  delete(id: EntryId): Promise<void>;
}

export interface EntryReader {
  findMany(): Promise<Entry[]>;
}
