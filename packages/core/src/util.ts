import type { Formatter, Indexer } from "./type.ts";

export function resolveFormatter(
  format: { type: string },
  map: FormatterMap,
): Formatter {
  const formatter = map[format.type];

  if (!formatter) throw new Error("unknown formatter");

  return formatter;
}

export interface FormatterMap {
  [type: string]: Formatter;
}

export function resolveIndexer(
  indexer: { type: string },
  map: IndexerMap,
): Indexer {
  const formatter = map[indexer.type];

  if (!formatter) throw new Error("unknown indexer");

  return formatter;
}

export interface IndexerMap {
  [type: string]: Indexer;
}
