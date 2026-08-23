import { Entry, type Model, Schema } from "@cosmos/core";
import { Result } from "@miyauci/util";

export interface UpdateCommand {
  id: string;
  contents: unknown;
}

export class EntryUpdateUseCase {
  constructor(
    private entryRepo: Entry.Repositry,
    private modelRepo: Model.Repositry,
    private schemaRepo: Schema.Repository,
  ) {}

  #interpreter = new Schema.Interpreter();

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

    const [node, nodeError] = this.#interpreter.interpret(
      command.contents,
      schema,
    );

    if (nodeError) throw new Error();

    const entry = Entry.of(
      entryId,
      modelId,
      node,
    );

    await this.entryRepo.save(entry);

    return Result.ok(undefined);
  }
}
