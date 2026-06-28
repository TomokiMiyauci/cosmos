import type { FieldCodec, Node, ReferenceNode, Structure } from "@cosmos/core";

export class ReferenceCodec implements FieldCodec {
  parse(structure: Structure): ReferenceNode {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "reference",
      value: structure,
    };
  }

  stringify(node: Node): Structure {
    if (node.type !== "reference") throw new Error();

    return node.value;
  }
}
