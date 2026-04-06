import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class NumberFieldCodec implements FieldCodec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    const num = Number.parseFloat(structure);

    if (Number.isNaN(num)) throw new SyntaxError();

    return {
      type: "number",
      value: num,
    };
  }

  stringify(): StructureValue {
    throw new Error("unimplemented");
  }
}
