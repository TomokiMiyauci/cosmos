import type { Formatter, Structure } from "@cosmos/core";

export class JsonFormatter implements Formatter {
  parse(content: string): Structure {
    return JSON.parse(content);
  }

  serialize(content: Structure): string {
    return JSON.stringify(content);
  }
}
