import type { Entry, Model, Schema } from "@cosmos/core";
import type { EntryUsecase, Protocol, Queries, Usecases } from "./protocol.ts";
import { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import { EntryUpdateUseCase } from "./application/usecases/entry/updation.ts";

export interface Config {
  protocol: Protocol;
  repositories: Repositories;
  queries: Queries;
}

export interface Repositories {
  entry: Entry.Repositry;
  model: Model.Repositry;
  schema: Schema.Repository;
}

export function createHandler(config: Config): Handler {
  const { repositories, queries } = config;
  const entry = {
    create: new EntryCreateUseCase(
      repositories.entry,
      repositories.model,
      repositories.schema,
    ),
    delete: new EntryDeleteUseCase(repositories.entry),
    update: new EntryUpdateUseCase(
      repositories.entry,
      repositories.model,
      repositories.schema,
    ),
  } satisfies EntryUsecase;
  const usecases = { entry } satisfies Usecases;

  return async (request) => {
    return await config.protocol.handle({ request, usecases, queries });
  };
}

export interface Handler {
  (request: Request): Promise<Response>;
}
