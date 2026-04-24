import type { Codec, CodecContext, Field, Node, Structure } from "@cosmos/core";

export interface FormatCodec {
  [k: string]: Codec;
}

export class StringCodec implements Codec {
  constructor(private formatCodec?: FormatCodec) {}
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (field.type !== "string") throw new Error();

    const formatCodec = field.format
      ? this.formatCodec?.[field.format]
      : undefined;

    if (formatCodec) {
      return formatCodec.parse(structure, field, ctx);
    }

    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "string",
      value: structure,
    };
  }

  stringify(node: Node): Structure {
    if (node.type !== "string") throw new Error();

    return node.value;
  }
}
