import type { EntryDto, SummaryDTO } from "./dto.ts";
import { Option } from "@miyauci/util";

export interface Reader {
  findMany(options?: QueryOptions): Promise<SummaryDTO[]>;
  findById(id: string): Promise<EntryDto | null>;
}

export interface QueryOptions {
  model?: string;
}

export class QueryService {
  constructor(private reader: Reader) {}

  async findSummaries(options?: QueryOptions): Promise<SummaryDTO[]> {
    const dto = await this.reader.findMany(options);

    return dto;
  }

  async findById(id: string): Promise<Option<EntryDto>> {
    const result = await this.reader.findById(id);

    if (!result) return Option.none;

    return Option.some(result);
  }
}
