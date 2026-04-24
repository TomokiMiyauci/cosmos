import type { Codec, Node, Structure } from "@cosmos/core";

export class DatetimeCodec implements Codec {
  parse(structure: Structure): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "datetime",
      value: new Date(structure),
    };
  }

  stringify(node: Node): Structure {
    if (node.type !== "datetime") throw new Error();

    return node.value.toISOString();
  }
}
