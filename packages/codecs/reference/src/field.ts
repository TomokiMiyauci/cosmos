import type { Codec, Node, StructureValue } from "@cosmos/core";

export class ReferenceCodec implements Codec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "reference",
      value: structure,
    };
  }

  stringify(): StructureValue {
    throw new Error("unimplemented");
  }
}
