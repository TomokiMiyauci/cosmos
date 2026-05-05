import type { Formatter, Locator } from "./types/core.ts";

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

export function resolveLocator(
  locator: { type: string },
  map: LocatorMap,
): Locator {
  const formatter = map[locator.type];

  if (!formatter) throw new Error("unknown locator");

  return formatter;
}

export interface LocatorMap {
  [type: string]: Locator;
}
