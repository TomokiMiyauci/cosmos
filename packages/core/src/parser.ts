import type { Config } from "@cosmos/core";
import type { Model, Node, Structure } from "./type.ts";

interface CodecContext {
  config: Config;
  url: URL;
}

export class Parser {
  async parse(
    content: Structure,
    model: Model,
    ctx: CodecContext,
  ): Promise<Node> {
    if (typeof content === "string") throw new Error("syntax error");

    const promise = model.fields.filter((field) => field.name in content).map(
      async (field) => {
        const { name } = field;

        const codec = ctx.config.fields[field.type];
        const node = await codec.parse(content[name], {
          url: ctx.url,
          baseUrl: ctx.url,
          resolver: ctx.config.resolver,
        });

        return [name, node] as const;
      },
    );
    const entries = await Promise.all(promise);

    return {
      type: "map",
      value: Object.fromEntries(entries),
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
