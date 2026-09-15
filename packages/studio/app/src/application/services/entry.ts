import type { Result } from "@miyauci/util";
import type { SchemaValue } from "@cosmos/schema";

export interface EntryService {
  save(entry: SaveEntry): Promise<Result<Entry["id"], EntrySaveError>>;
  findById(id: Entry["id"]): Promise<Entry | null>;
}

export interface Entry {
  id: string;
  modelId: string;
  content: SchemaValue;
}

type NewEntry = Omit<Entry, "id">;

export type SaveEntry = Entry | NewEntry;

export type EntrySaveError = ValidationFailure;

export interface ValidationFailure {
  type: "VALIDATION";

  errors: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
}
