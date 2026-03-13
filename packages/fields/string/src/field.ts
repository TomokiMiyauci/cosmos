import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class StringFieldCodec implements FieldCodec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "string",
      value: structure,
    };
  }

  strinigify(node: Node): StructureValue {
    if (node.type !== "string") throw new Error();

    return node.value;
  }
}
