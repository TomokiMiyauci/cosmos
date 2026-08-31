import type { Result } from "@miyauci/util";

export interface EntryService {
  create(entry: Entry): Promise<Result<void, EntryCreateError>>;
}

export interface Entry {
  modelId: string;
  content: any;
}

export type EntryCreateError = ValidationFailure;

export interface ValidationFailure {
  type: "VALIDATION";

  errors: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
}
