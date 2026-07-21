import {
  E as Entry,
  EntryId,
  EntryName,
  type EntryRepositry,
  ModelId,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type NewEntryInputDto, toNode } from "../../dto.ts";

export class EntryCreateUseCase {
  constructor(
    private entryRepo: EntryRepositry,
  ) {}

  async execute(
    input: NewEntryInputDto,
  ): Promise<Result<{ id: string }, Error>> {
    const id = EntryId.new();
    const [name, error] = EntryName.of(input.name);

    if (error) return Result.error(new Error());

    const [modelId, modelConstructError] = ModelId.of(input.model);

    if (modelConstructError) return Result.error(new Error());

    // const maybeModel = await this.modelRepo.findById(maybeModelId.value);

    // if (!maybeModel.ok) return Result.error(new Error());

    // const isValid = maybeModel.value.validateNode(input.node);

    // if (!isValid) return Result.error(new Error("validation error"));

    const entry = Entry.of(
      id,
      name,
      modelId,
      toNode(input.node),
    );

    await this.entryRepo.save(entry);

    return Result.ok({ id: id.value });
  }
}
