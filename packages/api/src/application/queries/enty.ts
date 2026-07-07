import type { EntryReader, QueryOptions } from "@cosmos/core";
import type { SummaryDTO } from "../dto.ts";

export class EntryQueryService {
  constructor(private reader: EntryReader) {}

  async findAll(options?: QueryOptions): Promise<SummaryDTO[]> {
    const entries = await this.reader.findMany(options);

    const dto = entries.map((entry) =>
      ({
        id: entry.id.value,
        name: entry.name.value,
        model: entry.model.value,
      }) satisfies SummaryDTO
    );

    return dto;
  }
}
