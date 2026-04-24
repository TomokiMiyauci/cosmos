import type { Codec, Node, Structure } from "@cosmos/core";

export class ReferenceCodec implements Codec {
  parse(structure: Structure): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "reference",
      value: structure,
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
