import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class DatetimeFieldCodec implements FieldCodec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "datetime",
      value: new Date(structure),
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "datetime") throw new Error();

    return node.value.toISOString();
  }
}
