import type {
  EntryCreateCommand,
  EntryUpsertCommand,
} from "./application/usecases/entry/register.ts";
import type { EntryDeleteCommand } from "./application/usecases/entry/deletion.ts";

export interface Commands {
  entry: EntryCommands;
}

export interface EntryCommands {
  create: EntryCreateCommand;
  upsert: EntryUpsertCommand;
  delete: EntryDeleteCommand;
}

export interface Protocol {
  handle(args: ProtocolArgs): Promise<Response> | Response;
}

export interface ProtocolArgs {
  request: Request;
  commands: Commands;
}
