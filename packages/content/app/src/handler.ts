import type { Entry, Model, Schema } from "@cosmos/core";
import type { EntryUsecase, Protocol, Usecases } from "./protocol.ts";
import { EntryRegisterUseCase } from "./application/usecases/entry/creation.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";

export interface Config {
  protocol: Protocol;
  repositories: Repositories;
}

export interface Ports {
  repositories: Repositories;
}

export interface Repositories {
  entry: Entry.Repositry;
  model: Model.Repositry;
  schema: Schema.Repository;
}

export function createHandler(ports: Ports, protocol: Protocol): Handler {
  const { repositories } = ports;
  const entry = {
    register: new EntryRegisterUseCase(
      repositories.entry,
      repositories.model,
      repositories.schema,
    ),
    delete: new EntryDeleteUseCase(repositories.entry),
  } satisfies EntryUsecase;
  const usecases = { entry } satisfies Usecases;

  return async (request) => {
    return await protocol.handle({ request, usecases });
  };
}

export interface Handler {
  (request: Request): Promise<Response>;
}
