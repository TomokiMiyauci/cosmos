import type { Result } from "@miyauci/util";

export interface EntryService {
  save(entry: SaveEntry): Promise<Result<Entry["id"], EntrySaveError>>;
}

export interface Entry {
  id: string;
  modelId: string;
  content: any;
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
