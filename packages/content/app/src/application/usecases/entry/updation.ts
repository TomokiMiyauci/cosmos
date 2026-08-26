import { Entry, type Model, type Schema } from "@cosmos/core";
import { Result } from "@miyauci/util";

export interface UpdateCommand {
  id: string;
  contents: Input;
}

type Input = string | number | boolean | Input[] | { [k: string]: Input };

export class EntryUpdateUseCase {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  async execute(
    command: UpdateCommand,
  ): Promise<Result<void, Error>> {
    const [entryId, entryFactoryError] = Entry.Id.from(command.id);

    if (entryFactoryError) return Result.error(new Error("invalid id"));

    const maybeCurrentEntry = await this.entryRepo.findById(entryId);

    if (!maybeCurrentEntry) return Result.error(new Error());

    const modelId = maybeCurrentEntry.modelId;

    const model = await this.modelRepo.findById(modelId);

    if (!model) throw new Error();

    const schema = await this.schemaRepo.findById(model.schemaId);

    if (!schema) throw new Error();

    const content = Entry.Content.of(command.contents);

    const entry = Entry.of(
      entryId,
      modelId,
      content,
    );

    await this.entryRepo.save(entry);

    return Result.ok(undefined);
  }
}
