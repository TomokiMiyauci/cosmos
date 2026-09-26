import type { Definition } from "@cosmos/schema-field";

export interface Queries {
  definition: DefinitionQuery;
  entrySummary: EntrySummaryQuery;
  model: ModelQuery;
}

export interface DefinitionQuery {
  findFor(modelId: string): Promise<Definition | null>;
}

export interface EntrySummary {
  id: string;
  title: string;
  updatedAt: Temporal.Instant;
}

export interface EntrySummaryQuery {
  listByModel(modelId: string): Promise<EntrySummary[]>;
}

export interface ModelQuery {
  findById(id: string): Promise<Model | null>;
  list(): Promise<Model[]>;
}

export interface Model {
  id: string;
  title: string;
}
