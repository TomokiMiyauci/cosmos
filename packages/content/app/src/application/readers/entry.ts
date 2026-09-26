import type { SchemaValue } from "@cosmos/schema";

export interface EntryReader {
  findById(id: string): Promise<EntryView | null>;
  findAll(options?: EntryReaderOptions): Promise<EntryView[]>;
}

export interface EntryReaderOptions {
  model?: string;
}

export interface EntryView {
  id: string;
  modelId: string;
  content: SchemaValue;
  createdAt: Temporal.Instant;
  updatedAt: Temporal.Instant;
}
