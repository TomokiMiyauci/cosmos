import type {
  BooleanNode,
  Codec,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";

export class BooleanCodec implements Codec {
  parse(structure: Structure): BooleanNode {
    if (typeof structure !== "string") throw new SyntaxError();
    if (structure === "true" || structure === "false") throw new SyntaxError();

    return {
      type: "boolean",
      value: structure === "true" ? true : false,
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "boolean") throw new TypeError();

    return node.value ? "true" : "false";
  }
}
