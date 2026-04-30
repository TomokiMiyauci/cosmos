import type { Codec, Field, Node, StringNode, Structure } from "@cosmos/core";
import { createStringNode } from "@cosmos/node-builder";

export interface FormatCodec {
  [k: string]: Codec;
}

export class StringCodec implements Codec {
  constructor() {}
  parse(
    structure: Structure,
    field: Field,
  ): Promise<StringNode> | StringNode {
    if (field.type !== "string") throw new Error();

    if (typeof structure !== "string") throw new SyntaxError();

    const node = createStringNode(structure);

    return node;
  }

  stringify(node: Node): Structure {
    if (node.type !== "string") throw new Error();

    return node.value;
  }
}
