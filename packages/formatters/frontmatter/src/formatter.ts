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

    const mainField = ctx.resource.main;
    const { header, body } = this.#frontmatter.parse(content);
    const headerFormatter = resolveFormatter(ctx.options.header, formatterMap);
    const bodyFormatter = resolveFormatter(ctx.options.body, formatterMap);
    const parsedHeader = headerFormatter.parse(header, {
      config: ctx.config,
      options: ctx.options.header,
      resource: ctx.resource,
    });
    const parsedBody = bodyFormatter.parse(body, {
      config: ctx.config,
      options: ctx.options.body,
      resource: ctx.resource,
    });

    if (typeof parsedHeader !== "string" && typeof parsedBody !== "string") {
      const data = { ...parsedHeader, ...parsedBody };

      return data;
    }

    if (typeof parsedHeader === "string" && typeof parsedBody !== "string") {
      if (mainField === undefined) {
        throw new Error(
          "resource main field is requried if the format is mix strucure",
        );
      }

      return {
        ...parsedBody,
        [mainField]: parsedHeader,
      };
    }

    if (typeof parsedBody === "string" && typeof parsedHeader !== "string") {
      if (mainField === undefined) {
        throw new Error(
          "resource main field is requried if the format is mix strucure",
        );
      }

      return {
        ...parsedHeader,
        [mainField]: parsedBody,
      };
    }

    throw new Error("header and body should not be string");
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
