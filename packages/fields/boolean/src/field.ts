import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class BooleanFieldCodec implements FieldCodec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();
    if (structure === "true" || structure === "false") throw new SyntaxError();

    return {
      type: "boolean",
      value: structure === "true" ? true : false,
    };
  }

  stringify(): StructureValue {
    throw new Error("unimplemented");
  }
}
