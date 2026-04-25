import {
  type FormatDefinition,
  type Formatter,
  type FormatterContext,
  resolveFormatter,
  type Structure,
} from "@cosmos/core";
import { Frontmatter } from "./parser.ts";

export class FrontmatterFormatter implements Formatter<FrontmatterOptions> {
  #frontmatter = new Frontmatter();
  parse(
    content: string,
    ctx: FormatterContext<FrontmatterOptions>,
  ): Structure {
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
    const parsed = {
      header: typeof parsedHeader === "string"
        ? { "": parsedHeader }
        : parsedHeader,
      body: typeof parsedBody === "string" ? { "": parsedBody } : parsedBody,
    };

    const data = { ...parsed.header, ...parsed.body };

    if (ctx.options.remap) {
      const renamed = rename(data, ctx.options.remap);

      return renamed;
    }

    return data;
  }

  serialize(): string {
    throw new Error("unimplemented");
  }
}

function rename<T>(
  value: Record<string, T>,
  map: Record<string, string>,
): Record<string, T> {
  return Object.keys(value).reduce<Record<string, T>>((acc, key) => {
    const newKey = map[key] || key;

    acc[newKey] = value[key]!;
    return acc;
  }, {});
}

export interface FrontmatterOptions {
  header: FormatDefinition;
  body: FormatDefinition;
  delimiter?: string;
  remap?: Record<string, string>;
}
