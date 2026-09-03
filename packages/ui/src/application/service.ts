import type { EntryService } from "./services/entry.ts";

export interface Services {
  entry: EntryService;
}

export type {
  Entry,
  EntrySaveError,
  EntryService,
  ValidationError,
  ValidationFailure,
} from "./services/entry.ts";
