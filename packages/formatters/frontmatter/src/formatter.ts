import {
  type Content,
  type FormatDefinition,
  type Formatter,
  type FormatterContext,
  resolveFormatter,
} from "@cosmos/core";
import { Frontmatter } from "./parser.ts";

export class FrontmatterFormatter implements Formatter<FrontmatterOptions> {
  #frontmatter = new Frontmatter();
  parse(
    content: string,
    ctx: FormatterContext<FrontmatterOptions>,
  ): Content {
    const formatterMap = ctx.config.formatters.reduce(
      (acc, { type, formatter }) => {
        return {
          ...acc,
          [type]: formatter,
        };
      },
      {},
    );

    const { header, body } = this.#frontmatter.parse(content);
    const headerFormatter = resolveFormatter(ctx.options.header, formatterMap);
    const bodyFormatter = resolveFormatter(ctx.options.body, formatterMap);
    const parsedHeader = headerFormatter.parse(header, {
      config: ctx.config,
      options: ctx.options.header,
    });
    const parsedBody = bodyFormatter.parse(body, {
      config: ctx.config,
      options: ctx.options.body,
    });

    const result = {
      ...parsedHeader,
      ...parsedBody,
    };

    return result;
  }

  serialize(): string {
    throw new Error("unimplemented");
  }
}

export interface FrontmatterOptions {
  header: FormatDefinition;
  body: FormatDefinition;
  delimiter?: string;
}
