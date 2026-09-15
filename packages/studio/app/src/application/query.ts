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
}

export interface EntrySummaryQuery {
  listByModel(modelId: string): Promise<EntrySummary[]>;
}

export interface ModelQuery {
  list(): Promise<Model[]>;
}

export interface Model {
  id: string;
  title: string;
}
