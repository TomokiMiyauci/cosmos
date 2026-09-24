import type { Entry, Model, Schema } from "~domain";
import type { Commands, EntryCommands, Protocol } from "./protocol.ts";
import {
  EntryCreateCommand,
  EntryUpsertCommand,
} from "./application/commands/entry/register.ts";
import { EntryDeleteCommand } from "./application/commands/entry/deletion.ts";

export interface Config {
  protocol: Protocol;
  repositories: Repositories;
}

export interface Ports {
  protocol: Protocol;
  repositories: Repositories;
}

export interface Repositories {
  entry: Entry.Repositry;
  model: Model.Repositry;
  schema: Schema.Repository;
}

export function createHandler(ports: Ports): Handler {
  const { repositories, protocol } = ports;
  const entry = {
    create: new EntryCreateCommand(
      repositories.entry,
      repositories.model,
      repositories.schema,
    ),
    upsert: new EntryUpsertCommand(
      repositories.entry,
      repositories.model,
      repositories.schema,
    ),
    delete: new EntryDeleteCommand(repositories.entry),
  } satisfies EntryCommands;
  const commands = { entry } satisfies Commands;

  return async (request) => {
    return await protocol.handle({ request, commands });
  };
}

export interface Handler {
  (request: Request): Promise<Response>;
}
