import type { Config } from "@cosmos/core";
import type { Model, Node, Structure } from "./type.ts";

interface CodecContext {
  config: Config;
}

export class Parser {
  parse(
    content: Structure,
    model: Model,
    ctx: CodecContext,
  ): Node {
    if (typeof content === "string") throw new Error("syntax error");

    const value = model.fields.reduce((acc, field) => {
      const { name } = field;

      if (name in content) {
        const codec = ctx.config.fields[field.type];
        const node = codec.parse(content[name]);

        return {
          ...acc,
          [name]: node,
        };
      }

      return acc;
    }, {});

    return {
      type: "map",
      value,
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
