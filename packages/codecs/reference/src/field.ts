import type { FieldCodec, ReferenceNode, Structure } from "@cosmos/core";

export class ReferenceCodec implements FieldCodec {
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
