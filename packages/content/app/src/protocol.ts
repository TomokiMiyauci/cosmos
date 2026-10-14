import type {
  EntryCreateCommand,
  EntryUpsertCommand,
} from "./application/commands/entry/register.ts";
import type { EntryDeleteCommand } from "./application/commands/entry/deletion.ts";
import type { EntryReader } from "./application/readers/entry.ts";
import type { ModelReader } from "./application/readers/model.ts";
import type { SchemaReader } from "./application/readers/schema.ts";

export interface Commands {
  entry: EntryCommands;
}

export interface EntryCommands {
  create: EntryCreateCommand;
  upsert: EntryUpsertCommand;
  delete: EntryDeleteCommand;
}

export interface Readers {
  entry: EntryReader;
  model: ModelReader;
  schema: SchemaReader;
}

export interface Protocol {
  handle(args: ProtocolArgs): Promise<Response> | Response;
}

export interface ProtocolArgs {
  request: Request;
  commands: Commands;
  readers: Readers;
}
