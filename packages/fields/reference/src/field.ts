import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class ReferenceFieldCodec implements FieldCodec {
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
