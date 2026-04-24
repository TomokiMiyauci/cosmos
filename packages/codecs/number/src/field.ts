import type { Codec, Node, Structure } from "@cosmos/core";

export class NumberCodec implements Codec {
  parse(structure: Structure): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    const num = Number.parseFloat(structure);

    if (Number.isNaN(num)) throw new SyntaxError();

    return {
      type: "number",
      value: num,
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
