import type { Result } from "@miyauci/util";
import type { Value } from "@cosmos/validator";

export interface EntryService {
  save(entry: SaveEntry): Promise<Result<Entry["id"], EntrySaveError>>;
}

export interface Entry {
  id: string;
  modelId: string;
  content: Value;
}

type NewEntry = Omit<Entry, "id">;

type SaveEntry = Entry | NewEntry;

export type EntrySaveError = ValidationFailure;

export interface ValidationFailure {
  type: "VALIDATION";

  errors: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
}
