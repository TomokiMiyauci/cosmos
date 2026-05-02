import type { Formatter } from "./type.ts";

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
