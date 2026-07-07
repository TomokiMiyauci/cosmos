import {
  E as Entry,
  EntryId,
  EntryModel,
  EntryName,
  type EntryRepositry,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import {
  type EntryDto,
  fromEntry,
  type NewEntryInputDto,
  toNode,
} from "../../dto.ts";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(input: NewEntryInputDto): Promise<Result<EntryDto, Error>> {
    const id = EntryId.new();
    const maybeName = EntryName.of(input.name);

    if (!maybeName.ok) return Result.error(new Error());

    const maybeModel = EntryModel.of(input.model);

    if (!maybeModel.ok) return Result.error(new Error());

    const entry = Entry.of(
      id,
      maybeName.value,
      maybeModel.value,
      toNode(input.node),
    );

    await this.repositry.save(entry);

    const dto = fromEntry(entry);

    return Result.ok(dto);
  }
}
