import type { Formatter, FormatterDefinitionBase } from "./type.ts";

export function resolveFormatter(
  format: FormatterDefinitionBase<string>,
  map: FormatterMap,
): Formatter {
  const formatter = map[format.type];

  if (!formatter) throw new Error("unknown formatter");

  return formatter;
}

export interface FormatterMap {
  [type: string]: Formatter;
}
