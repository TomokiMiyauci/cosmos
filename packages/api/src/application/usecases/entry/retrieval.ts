import { EntryId, type EntryRepositry } from "@cosmos/core";
import { Option, Result } from "@miyauci/util";
import { type EntryDto, fromEntry } from "../../dto.ts";

export class EntryRetrievalUseCase {
  constructor(private repositry: EntryRepositry) {}

  async execute(id: string): Promise<Result<Option<EntryDto>, Error>> {
    const maybeId = EntryId.from(id);

    if (!maybeId.ok) return Result.error(new Error());

    const result = await this.repositry.findById(maybeId.value);

    if (!result.ok) return Result.ok(Option.none);

    const dto = fromEntry(result.value);

    return Result.ok(Option.some(dto));
  }
}
