import type { Codec, Node, Structure } from "@cosmos/core";

export class BooleanCodec implements Codec {
  parse(structure: Structure): Node {
    if (typeof structure !== "string") throw new SyntaxError();
    if (structure === "true" || structure === "false") throw new SyntaxError();

    return {
      type: "boolean",
      value: structure === "true" ? true : false,
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
