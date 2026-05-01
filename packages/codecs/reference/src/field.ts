import type { Codec, ReferenceNode, Structure } from "@cosmos/core";

export class ReferenceCodec implements Codec {
  parse(structure: Structure): ReferenceNode {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "reference",
      value: new URL(structure),
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}
