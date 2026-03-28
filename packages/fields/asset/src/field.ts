import type { FieldCodec, Node, StructureValue } from "@cosmos/core";

export class AssetFieldCodec implements FieldCodec {
  parse(structure: StructureValue): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "asset",
      value: new URL(structure),
    };
  }

  strinigify(node: Node): StructureValue {
    if (node.type !== "asset") throw new Error();

    return node.value.toString();
  }
}
