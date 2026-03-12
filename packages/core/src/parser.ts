import type { Config, Field, StructureValue } from "@cosmos/core";
import type { Model, Node, Structure } from "./type.ts";

interface CodecContext {
  config: Config;
}

export class Parser {
  parse(
    content: Structure,
    model: Model,
    _: CodecContext,
  ): Node {
    if (typeof content === "string") throw new Error("syntax error");

    const value = model.fields.reduce((acc, field) => {
      const { name } = field;

      if (name in content) {
        const node = parseNode(content[name], field);

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

function parseNode(content: StructureValue, field: Field): Node {
  switch (field.type) {
    case "string": {
      if (typeof content !== "string") throw new SyntaxError();

      return {
        type: "string",
        value: content,
      };
    }
    case "boolean": {
      if (content === "true" || content === "false") throw new SyntaxError();

      return {
        type: "boolean",
        value: content === "true" ? true : false,
      };
    }
    case "reference": {
      if (typeof content !== "string") throw new SyntaxError();

      return {
        type: "id",
        value: content,
      };
    }
  }
}
