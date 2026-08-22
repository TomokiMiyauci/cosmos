import type {
  CreateCommand,
  CreationError,
  EntryCreateUseCase,
} from "../application/usecases/entry/creation.ts";
import type { Content } from "@cosmos/core";
import type { Result } from "@miyauci/util";

export interface CreateInput {
  model: string;
  contents: Content;
}

export class EntryController {
  constructor(private creationUsecase: EntryCreateUseCase) {}
  async create(input: CreateInput): Promise<Result<string, CreationError>> {
    const command = {
      contents: input.contents,
      model: input.model,
    } satisfies CreateCommand;
    const result = await this.creationUsecase.execute(command);

    return result;
  }
}
