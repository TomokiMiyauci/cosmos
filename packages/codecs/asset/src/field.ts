import type {
  AssetNode,
  FieldCodec,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";

export class AssetCodec implements FieldCodec {
  parse(structure: Structure): AssetNode {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "asset",
      value: new URL(structure),
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "asset") throw new Error();

    return node.value.toString();
  }
}
