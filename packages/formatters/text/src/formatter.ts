import type { Formatter, Structure } from "@cosmos/core";

export class TextFormatter implements Formatter {
  parse(
    content: string,
  ): Structure {
    return content;
  }

  serialize(content: Structure): string {
    if (typeof content !== "string") throw new Error();

    return content;
  }
}
