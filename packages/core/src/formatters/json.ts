import type { Formatter } from "../type.ts";

export class JSONFormatter implements Formatter {
  parse(content: string): Record<string, unknown> {
    return JSON.parse(content);
  }

  serialize(content: Record<string, unknown>): string {
    return JSON.stringify(content);
  }
}
