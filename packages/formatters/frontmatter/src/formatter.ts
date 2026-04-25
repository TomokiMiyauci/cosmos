import {
  type FormatDefinition,
  type Formatter,
  type FormatterContext,
  resolveFormatter,
  type Structure,
  type StructureObject,
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

    const remappedHeader = remap(
      parsedHeader,
      ctx.options.headerKey,
      "headerKey is required",
    );
    const remappedBody = remap(
      parsedBody,
      ctx.options.bodyKey,
      "bodyKey is required",
    );

    const data = { ...remappedHeader, ...remappedBody };

    return data;
  }

  serialize(): string {
    throw new Error("unimplemented");
  }
}

function remap(
  structure: Structure,
  key: string | undefined,
  msg?: string,
): StructureObject {
  if (typeof structure === "string") {
    if (typeof key === "undefined") {
      throw new Error(msg ?? "key is required");
    }

    return {
      [key]: structure,
    };
  }

  return structure;
}

export interface FrontmatterOptions {
  header: FormatDefinition;
  body: FormatDefinition;
  delimiter?: string;
  headerKey?: string;
  bodyKey?: string;
}
