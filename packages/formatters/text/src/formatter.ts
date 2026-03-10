import type { Content, Formatter, FormatterContext } from "@cosmos/core";

export class TextFormatter implements Formatter<TextOptions> {
  parse(
    content: string,
    ctx: FormatterContext<TextOptions>,
  ): Content {
    return {
      [ctx.options.field]: content,
    };
  }

  serialize(content: Content, ctx: FormatterContext<TextOptions>): string {
    const body = content[ctx.options.field];

    return body;
  }
}

export interface TextOptions {
  field: string;
}
