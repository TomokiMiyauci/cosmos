import type { Formatter, FormatterContext, Structure } from "@cosmos/core";

export class TextFormatter implements Formatter<TextOptions> {
  parse(
    content: string,
    ctx: FormatterContext<TextOptions>,
  ): Structure {
    return {
      [ctx.options.field]: content,
    };
  }

  serialize(content: Structure, ctx: FormatterContext<TextOptions>): string {
    const body = content[ctx.options.field];

    return body;
  }
}

export interface TextOptions {
  field: string;
}
