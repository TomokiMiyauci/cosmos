import type { components } from "./schema.d.ts";

type Schemas = components["schemas"];

export type Contents = Schemas["Contents"];
export type Entry = Schemas["Entry"];
export type EntryDto = Schemas["EntryDto"];
export type EntryInputDto = Schemas["EntryInputDto"];
export type Resource = Schemas["Resource"];
export type Model = Schemas["Model"];
export type SummaryDto = Schemas["SummaryDto"];
export type NewEntryInputDto = Schemas["NewEntryInputDto"];
