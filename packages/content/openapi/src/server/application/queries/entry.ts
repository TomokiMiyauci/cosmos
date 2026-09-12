import type { SchemaValue } from "@cosmos/schema";

export interface EntryQuery {
  findById(id: string): Promise<EntryView | null>;
  findAll(options: { model?: string }): Promise<EntryView[]>;
}

export interface EntryView {
  id: string;
  modelId: string;
  content: SchemaValue;
}
