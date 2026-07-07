import {
  E as Entry,
  EntryId,
  EntryModel,
  EntryName,
  type EntryRepositry,
} from "@cosmos/core";
import { Result } from "@miyauci/util";
import { type EntryDto, fromEntry, type NodeJson, toNode } from "../../dto.ts";

export class EntryCreateUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(
    name: string,
    model: string,
    node: NodeJson,
  ): Promise<Result<EntryDto, Error>> {
    const id = EntryId.new();
    const maybeName = EntryName.of(name);

    if (!maybeName.ok) return Result.error(new Error());

    const maybeModel = EntryModel.of(model);

    if (!maybeModel.ok) return Result.error(new Error());

    const entry = Entry.of(id, maybeName.value, maybeModel.value, toNode(node));

    await this.repositry.save(entry);

    const dto = fromEntry(entry);

    return Result.ok(dto);
  }
}
