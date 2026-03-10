import type { Content, Formatter } from "@cosmos/core";

export class JSONFormatter implements Formatter {
  parse(content: string): Content {
    return JSON.parse(content);
  }

  serialize(content: Content): string {
    return JSON.stringify(content);
  }
}
