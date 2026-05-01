import type { FieldCodec, Node, NumberNode, Structure } from "@cosmos/core";

export class NumberCodec implements FieldCodec {
  parse(structure: Structure): NumberNode {
    if (typeof structure !== "string") throw new SyntaxError();

    const num = Number.parseFloat(structure);

    if (Number.isNaN(num)) throw new SyntaxError();

    return {
      type: "number",
      value: num,
    };
  }

  stringify(node: Node): Structure {
    if (node.type !== "number") throw new TypeError();

    return node.value.toString();
  }
}
