import type { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import type { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import type { EntryUpdateUseCase } from "./application/usecases/entry/updation.ts";

export interface Usecases {
  entry: EntryUsecase;
}

export interface EntryUsecase {
  create: EntryCreateUseCase;
  delete: EntryDeleteUseCase;
  update: EntryUpdateUseCase;
}

export interface Protocol {
  handle(args: ProtocolArgs): Promise<Response> | Response;
}

export interface ProtocolArgs {
  request: Request;
  usecases: Usecases;
}
