import type { ModelQuery, ModelView, ModelViewType } from "./queries/model.ts";
import type { SchemaQuery, SchemaView } from "./queries/schema.ts";
import type { EntryQuery, EntryView } from "./queries/entry.ts";

export interface Queries {
  model: ModelQuery;
  schema: SchemaQuery;
  entry: EntryQuery;
}

export type {
  EntryQuery,
  EntryView,
  ModelQuery,
  ModelView,
  ModelViewType,
  SchemaQuery,
  SchemaView,
};
