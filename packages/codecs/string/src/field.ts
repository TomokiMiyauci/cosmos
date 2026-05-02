import type {
  Codec,
  FieldCodec,
  Node,
  StringNode,
  Structure,
} from "@cosmos/core";
import { createStringNode } from "@cosmos/node-builder";

export interface FormatCodec {
  [k: string]: Codec;
}

export class StringCodec implements FieldCodec {
  parse(
    structure: Structure,
  ): Promise<StringNode> | StringNode {
    if (typeof structure !== "string") throw new SyntaxError();

    const node = createStringNode(structure);

    return node;
  }

  stringify(node: Node): Structure {
    if (node.type !== "string") throw new Error();

    return node.value;
  }
}
