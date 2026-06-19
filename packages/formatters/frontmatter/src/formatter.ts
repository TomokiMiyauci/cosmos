import type {
  FormatDefinition,
  Formatter,
  FormatterContext,
  Structure,
} from "@cosmos/core";
import { Frontmatter } from "./parser.ts";

export class FrontmatterFormatter implements Formatter {
  #frontmatter = new Frontmatter();
  parse(
    content: string,
    ctx: FormatterContext,
  ): Structure {
    const mainField = ctx.resource.main;
    const option = ctx.option as FrontmatterOptions;
    const { header, body } = this.#frontmatter.parse(content);
    const headerFormatter = ctx.config.formats[option.header.type];

    if (!headerFormatter) throw new Error("header formatter not found");

    const bodyFormatter = ctx.config.formats[option.body.type];

    if (!bodyFormatter) throw new Error("body formatter not found");

    const parsedHeader = headerFormatter.parse(header, {
      config: ctx.config,
      option: option.header.option,
      resource: ctx.resource,
    });
    const parsedBody = bodyFormatter.parse(body, {
      config: ctx.config,
      option: option.body.option,
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

  serialize(structure: Structure, ctx: FormatterContext): string {
    const mainField = ctx.resource.main;
    const option = ctx.option as FrontmatterOptions;
    const headerFormatter = ctx.config.formats[option.header.type];
    const bodyFormatter = ctx.config.formats[option.body.type];

    if (!headerFormatter) throw new Error("header formatter not found");
    if (!bodyFormatter) throw new Error("body formatter not found");

    if (typeof mainField === "string" && typeof structure !== "string") {
      const { [mainField]: bodyContent, ...rest } = structure;

      const header = headerFormatter.serialize(rest, ctx);
      const body = bodyFormatter.serialize(bodyContent ?? "", ctx);

      return this.#frontmatter.stringify({ header, body });
    }

    const header = headerFormatter.serialize(structure, ctx);

    return this.#frontmatter.stringify({ header, body: "" });
  }
}

export interface FrontmatterOptions {
  header: FormatDefinition;
  body: FormatDefinition;
  delimiter?: string;
}
