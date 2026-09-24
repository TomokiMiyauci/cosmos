import type {
  EntryCreateCommand,
  EntryUpsertCommand,
} from "./application/usecases/entry/register.ts";
import type { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";

export interface Usecases {
  entry: EntryUsecase;
}

export interface EntryUsecase {
  create: EntryCreateCommand;
  upsert: EntryUpsertCommand;
  delete: EntryDeleteUseCase;
}

export interface Protocol {
  handle(args: ProtocolArgs): Promise<Response> | Response;
}

export interface ProtocolArgs {
  request: Request;
  usecases: Usecases;
}
