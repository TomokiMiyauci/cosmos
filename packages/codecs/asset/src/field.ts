import type {
  AssetNode,
  Codec,
  Field,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";

export class AssetCodec implements Codec {
  parse(structure: Structure, _: Field): AssetNode {
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
